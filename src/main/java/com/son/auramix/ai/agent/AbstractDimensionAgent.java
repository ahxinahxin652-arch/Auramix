package com.son.auramix.ai.agent;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.son.auramix.ai.dto.AgentResult;
import com.son.auramix.ai.dto.ReviewContext;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.chat.client.ChatClient;

@Slf4j
public abstract class AbstractDimensionAgent implements DimensionAgent {

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
        try {
            String response = chatClient.prompt()
                    .user(prompt)
                    .call()
                    .content();
            return parseResponse(response, getName());
        } catch (Exception e) {
            log.error("[AI审核] trackId={} agent={} 异常", ctx.getTrackId(), getName(), e);
            return AgentResult.builder()
                    .agentName(getName())
                    .verdict("FAIL")
                    .confidence(0)
                    .reason("agent调用异常: " + e.getMessage())
                    .build();
        }
    }

    String buildPrompt(ReviewContext ctx) {
        StringBuilder sb = new StringBuilder();
        sb.append("请审核以下音乐内容：\n");
        sb.append("歌曲标题: ").append(ctx.getTrackTitle()).append("\n");
        sb.append("歌手: ").append(ctx.getArtistNames() != null ? ctx.getArtistNames() : "未知").append("\n");
        sb.append("专辑: ").append(ctx.getAlbumTitle() != null ? ctx.getAlbumTitle() : "未知").append("\n");
        if (ctx.isHasLyrics()) {
            sb.append("歌词: ").append(ctx.getLyricsContent()).append("\n");
        } else {
            sb.append("歌词: 无歌词，仅审核元信息\n");
        }
        sb.append("\n请从以下维度进行判断：\n");
        sb.append(getCriteria());
        sb.append("\n请严格审核，以JSON输出：{\"verdict\":\"PASS|FAIL\",\"confidence\":0-100,\"reason\":\"...\"}\n");
        sb.append("verdict为PASS时reason可为null。confidence为你的置信度(0-100整数)。");
        return sb.toString();
    }

    private AgentResult parseResponse(String response, String agentName) {
        try {
            String json = extractJson(response);
            JsonNode node = objectMapper.readTree(json);
            String verdict = node.has("verdict") ? node.get("verdict").asText() : "FAIL";
            int confidence = node.has("confidence") ? node.get("confidence").asInt() : 0;
            String reason = node.has("reason") && !node.get("reason").isNull()
                    ? node.get("reason").asText() : null;
            return AgentResult.builder()
                    .agentName(agentName)
                    .verdict(verdict)
                    .confidence(confidence)
                    .reason(reason)
                    .build();
        } catch (Exception e) {
            log.error("[AI审核] agent={} JSON解析失败 raw={}", agentName, response, e);
            return AgentResult.builder()
                    .agentName(agentName)
                    .verdict("FAIL")
                    .confidence(0)
                    .reason("agent输出格式异常")
                    .build();
        }
    }

    private String extractJson(String response) {
        if (response == null) return "{}";
        String trimmed = response.trim();
        if (trimmed.startsWith("```")) {
            trimmed = trimmed.replaceAll("^```(json)?\\s*", "").replaceAll("\\s*```$", "");
        }
        int start = trimmed.indexOf('{');
        int end = trimmed.lastIndexOf('}');
        if (start >= 0 && end > start) {
            return trimmed.substring(start, end + 1);
        }
        return trimmed;
    }
}
