package com.son.auramix.ai.agent;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.son.auramix.ai.dto.AgentResult;
import com.son.auramix.ai.dto.ReviewContext;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * 最终裁决 agent — 汇总 4 维度 agent 结果，做最终置信度评估与裁决。
 * 注意：此 agent 不实现 ReviewAgent 接口，因为其方法签名不同。
 * <p>
 * 优化点：
 * 1) buildPrompt 把各维度 analysis 正向分析 + counterArgument 反面论证 + 原始内容传给裁决 agent，
 *    使其能做语义级"过度敏感纠偏"（参考反面论证判断豁免是否成立）；
 * 2) retry 1 次后仍失败 → 降级为 PENDING 转人工（而非 FAIL）；
 * 3) 任一维度 PENDING → 整体直接 PENDING，跳过裁决；
 *    实际短路在 ReviewOrchestrator 完成，这里在 buildPrompt 阶段仍会收到完整列表作兜底。
 */
@Slf4j
@Component
public class ReviewJudgeAgent {

    private static final int MAX_RETRIES = 1;

    private final ChatClient chatClient;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public ReviewJudgeAgent(@Qualifier("judgeChatClient") ChatClient chatClient) {
        this.chatClient = chatClient;
    }

    /**
     * 裁决：汇总 4 维度 agent 结果
     */
    public AgentResult judge(ReviewContext ctx, List<AgentResult> dimensionResults) {
        try {
            String prompt = buildPrompt(ctx, dimensionResults);
            String response = null;
            AgentResult result = null;
            Exception lastException = null;

            for (int attempt = 0; attempt <= MAX_RETRIES && result == null; attempt++) {
                try {
                    response = chatClient.prompt()
                            .user(prompt)
                            .call()
                            .content();
                    result = parseResponse(response);
                } catch (Exception e) {
                    lastException = e;
                    log.warn("[AI审核] trackId={} judge agent 第{}次调用异常: {}",
                            ctx.getTrackId(), attempt + 1, e.getMessage());
                }
            }

            if (result != null) {
                return result;
            }

            log.error("[AI审核] trackId={} judge agent 重试后仍失败，降级 PENDING 转人工",
                    ctx.getTrackId(), lastException);
            return AgentResult.builder()
                    .agentName("ReviewJudge")
                    .verdict("PENDING")
                    .confidence(0)
                    .reason("裁决agent调用异常，转人工确认: "
                            + (lastException != null ? lastException.getClass().getSimpleName()
                                    + " - " + lastException.getMessage() : "未知异常"))
                    .analysis(null)
                    .build();
        } catch (Exception e) {
            log.error("[AI审核] trackId={} judge agent 异常", ctx.getTrackId(), e);
            return AgentResult.builder()
                    .agentName("ReviewJudge")
                    .verdict("PENDING")
                    .confidence(0)
                    .reason("裁决agent调用异常，转人工确认: " + e.getClass().getSimpleName()
                            + " - " + e.getMessage())
                    .analysis(null)
                    .build();
        }
    }

    private String buildPrompt(ReviewContext ctx, List<AgentResult> dimensionResults) {
        StringBuilder sb = new StringBuilder();
        sb.append("原始待审内容：\n");
        sb.append("歌曲标题: ").append(ctx.getTrackTitle()).append("\n");
        sb.append("歌手: ").append(ctx.getArtistNames() != null ? ctx.getArtistNames() : "未知").append("\n");
        sb.append("专辑: ").append(ctx.getAlbumTitle() != null ? ctx.getAlbumTitle() : "未知").append("\n");
        sb.append("歌词: ").append(ctx.isHasLyrics() && ctx.getLyricsContent() != null
                ? ctx.getLyricsContent() : "无歌词").append("\n\n");

        sb.append("以下是 4 个维度审核 agent 的输出结果（含各自的思维链分析）：\n\n");
        for (AgentResult ar : dimensionResults) {
            sb.append("- ").append(ar.getAgentName()).append(":\n");
            sb.append("  verdict=").append(ar.getVerdict());
            sb.append(", confidence=").append(ar.getConfidence()).append("\n");
            if (ar.getReason() != null) {
                sb.append("  reason=").append(ar.getReason()).append("\n");
            }
            if (ar.getAnalysis() != null) {
                sb.append("  analysis=").append(ar.getAnalysis()).append("\n");
            }
            if (ar.getCounterArgument() != null) {
                sb.append("  counterArgument=").append(ar.getCounterArgument()).append("\n");
            }
            sb.append("\n");
        }
        sb.append("请根据裁决规则进行最终判断，先写 analysis 复核各维度结论，再下 verdict。以 JSON 输出。");
        return sb.toString();
    }

    private AgentResult parseResponse(String response) {
        try {
            String json = extractJson(response);
            JsonNode node = objectMapper.readTree(json);
            String verdict = node.has("verdict") ? node.get("verdict").asText() : "PENDING";
            if ("PASS".equalsIgnoreCase(verdict) || "通过".equals(verdict)) {
                verdict = "PASS";
            } else if ("FAIL".equalsIgnoreCase(verdict)
                    || "不通过".equals(verdict) || "未通过".equals(verdict)) {
                verdict = "FAIL";
            } else {
                verdict = "PENDING";
            }
            int confidence = node.has("confidence") ? node.get("confidence").asInt() : 0;
            confidence = Math.max(0, Math.min(100, confidence));
            String failReasons = node.has("failReasons") && !node.get("failReasons").isNull()
                    ? node.get("failReasons").asText() : null;
            String analysis = node.has("analysis") && !node.get("analysis").isNull()
                    ? node.get("analysis").asText() : null;
            // 兜底：PASS 时 LLM 仍可能返回 null failReasons，补上默认描述
            if ("PASS".equals(verdict) && (failReasons == null || failReasons.isBlank())) {
                failReasons = "各维度审核均通过，内容正常";
            }
            return AgentResult.builder()
                    .agentName("ReviewJudge")
                    .verdict(verdict)
                    .confidence(confidence)
                    .reason(failReasons)
                    .analysis(analysis)
                    .build();
        } catch (Exception e) {
            log.warn("[AI审核] judge agent JSON解析失败 raw={}", response, e);
            return null; // 触发 retry
        }
    }

    private String extractJson(String response) {
        if (response == null) return "{}";
        String trimmed = response.trim();
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
            if (escape) { escape = false; continue; }
            if (c == '\\' && inString) { escape = true; continue; }
            if (c == '"') { inString = !inString; continue; }
            if (inString) continue;
            if (c == '{') depth++;
            else if (c == '}') {
                depth--;
                if (depth == 0) return trimmed.substring(start, i + 1);
            }
        }
        return trimmed.substring(start);
    }
}
