package com.son.auramix.ai.agent;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.son.auramix.ai.dto.AgentResult;
import com.son.auramix.ai.dto.ReviewContext;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.chat.client.ChatClient;

/**
 * 维度审核 agent 抽象基类。
 * <p>
 * 优化点：
 * 1) 思维链输出（Chain-of-Verification）：system prompt 要求 LLM 先写 analysis 正向分析，
 *    再写 counterArgument 反面论证（考虑豁免/语境正当性），最后综合两者下 verdict；
 *    本类解析时保留 analysis 与 counterArgument 供 judge agent 跨维度纠偏；
 * 2) extractJson 容错：用平衡花括号匹配替代"首末花括号"截取，避免 reason 含 } 时被截断；
 * 3) retry：首次解析失败或调用异常时重试 1 次，减少偶发抖动导致的假阳性；
 * 4) 异常降级为 PENDING（而非 FAIL）：解析仍失败时返回 verdict=PENDING/confidence=0，
 *    配合 ReviewServiceImpl 的 confidence<80 走 status=3（待人工确认），避免误杀。
 */
@Slf4j
public abstract class AbstractDimensionAgent implements DimensionAgent {

    /** 解析失败/异常时的重试次数 */
    private static final int MAX_RETRIES = 1;

    protected final ChatClient chatClient;
    protected final ObjectMapper objectMapper = new ObjectMapper();

    protected AbstractDimensionAgent(ChatClient chatClient) {
        this.chatClient = chatClient;
    }

    @Override
    public boolean supports(String reviewType) {
        return "TEXT_ONLY".equals(reviewType) || "TEXT_AUDIO".equals(reviewType);
    }

    @Override
    public AgentResult review(ReviewContext ctx) {
        String prompt = buildPrompt(ctx);
        AgentResult result = null;
        Exception lastException = null;

        // 首次调用 + 至多 MAX_RETRIES 次重试
        for (int attempt = 0; attempt <= MAX_RETRIES && result == null; attempt++) {
            try {
                String response = chatClient.prompt()
                        .user(prompt)
                        .call()
                        .content();
                result = parseResponse(response, getName());
            } catch (Exception e) {
                lastException = e;
                log.warn("[AI审核] trackId={} agent={} 第{}次调用异常: {}",
                        ctx.getTrackId(), getName(), attempt + 1, e.getMessage());
            }
        }

        if (result != null) {
            return result;
        }

        // 重试仍失败 → 降级为 PENDING，转人工确认，不直接 FAIL 误杀
        log.error("[AI审核] trackId={} agent={} 重试后仍失败，降级 PENDING 转人工",
                ctx.getTrackId(), getName(), lastException);
        return AgentResult.builder()
                .agentName(getName())
                .verdict("PENDING")
                .confidence(0)
                .reason("agent调用异常，转人工确认: "
                        + (lastException != null ? lastException.getClass().getSimpleName()
                                + " - " + lastException.getMessage() : "未知异常"))
                .analysis(null)
                .build();
    }

    /** 歌词最大长度（超出截断，避免 LLM 上下文溢出） */
    private static final int MAX_LYRICS_LENGTH = 2000;

    String buildPrompt(ReviewContext ctx) {
        StringBuilder sb = new StringBuilder();
        sb.append("请审核以下音乐内容：\n");
        sb.append("歌曲标题: ").append(ctx.getTrackTitle()).append("\n");
        sb.append("歌手: ").append(ctx.getArtistNames() != null ? ctx.getArtistNames() : "未知").append("\n");
        sb.append("专辑: ").append(ctx.getAlbumTitle() != null ? ctx.getAlbumTitle() : "未知").append("\n");
        if (ctx.isHasLyrics()) {
            String lyrics = ctx.getLyricsContent();
            if (lyrics != null && lyrics.length() > MAX_LYRICS_LENGTH) {
                lyrics = lyrics.substring(0, MAX_LYRICS_LENGTH) + "\n...(歌词过长已截断)";
            }
            sb.append("歌词: ").append(lyrics).append("\n");
        } else {
            sb.append("歌词: 无歌词，仅审核元信息，若与本维度无关则 confidence=100\n");
        }
        sb.append("\n请从以下维度进行判断：\n");
        sb.append(getCriteria());
        sb.append("\n\n请严格按 system prompt 中约定的 JSON 格式输出，先写 analysis 再下 verdict。");
        return sb.toString();
    }

    private AgentResult parseResponse(String response, String agentName) {
        try {
            String json = extractJson(response);
            JsonNode node = objectMapper.readTree(json);
            String verdict = node.has("verdict") ? node.get("verdict").asText() : "PENDING";
            // 兜底：LLM 偶发返回小写或中文，统一成大写枚举
            if ("PASS".equalsIgnoreCase(verdict) || "通过".equals(verdict)) {
                verdict = "PASS";
            } else if ("FAIL".equalsIgnoreCase(verdict) || "不通过".equals(verdict) || "未通过".equals(verdict)) {
                verdict = "FAIL";
            } else {
                verdict = "PENDING";
            }
            int confidence = node.has("confidence") ? node.get("confidence").asInt() : 0;
            // confidence 范围夹取，避免 LLM 越界
            confidence = Math.max(0, Math.min(100, confidence));
            String reason = node.has("reason") && !node.get("reason").isNull()
                    ? node.get("reason").asText() : null;
            String analysis = node.has("analysis") && !node.get("analysis").isNull()
                    ? node.get("analysis").asText() : null;
            String counterArgument = node.has("counterArgument") && !node.get("counterArgument").isNull()
                    ? node.get("counterArgument").asText() : null;
            return AgentResult.builder()
                    .agentName(agentName)
                    .verdict(verdict)
                    .confidence(confidence)
                    .reason(reason)
                    .analysis(analysis)
                    .counterArgument(counterArgument)
                    .build();
        } catch (Exception e) {
            log.warn("[AI审核] agent={} JSON解析失败 raw={}", agentName, response, e);
            return null; // 返回 null 触发 retry
        }
    }

    /**
     * 从 LLM 响应中提取 JSON 对象。
     * 用平衡花括号计数匹配最外层 {}，避免 reason 含 } 被首末花括号截断。
     */
    private String extractJson(String response) {
        if (response == null) return "{}";
        String trimmed = response.trim();
        // 去除 ```json ... ``` 包裹
        if (trimmed.startsWith("```")) {
            trimmed = trimmed.replaceAll("^```(json)?\\s*", "").replaceAll("\\s*```$", "");
        }
        int start = trimmed.indexOf('{');
        if (start < 0) return "{}";
        int depth = 0;
        boolean inString = false;
        boolean escape = false;
        for (int i = start; i < trimmed.length(); i++) {
            char c = trimmed.charAt(i);
            if (escape) {
                escape = false;
                continue;
            }
            if (c == '\\' && inString) {
                escape = true;
                continue;
            }
            if (c == '"') {
                inString = !inString;
                continue;
            }
            if (inString) continue;
            if (c == '{') depth++;
            else if (c == '}') {
                depth--;
                if (depth == 0) {
                    return trimmed.substring(start, i + 1);
                }
            }
        }
        // 花括号不平衡，返回尽力截取
        return trimmed.substring(start);
    }
}
