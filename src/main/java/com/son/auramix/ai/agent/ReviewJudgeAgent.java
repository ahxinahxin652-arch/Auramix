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
 */
@Slf4j
@Component
public class ReviewJudgeAgent {

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
            String response = chatClient.prompt()
                    .user(prompt)
                    .call()
                    .content();
            return parseResponse(response);
        } catch (Exception e) {
            log.error("[AI审核] trackId={} judge agent 异常", ctx.getTrackId(), e);
            return AgentResult.builder()
                    .agentName("ReviewJudge")
                    .verdict("FAIL")
                    .confidence(0)
                    .reason("裁决agent调用异常: " + e.getMessage())
                    .build();
        }
    }

    private String buildPrompt(ReviewContext ctx, List<AgentResult> dimensionResults) {
        StringBuilder sb = new StringBuilder();
        sb.append("以下是 4 个维度审核 agent 的输出结果：\n\n");
        for (AgentResult ar : dimensionResults) {
            sb.append("- ").append(ar.getAgentName()).append(": ");
            sb.append("verdict=").append(ar.getVerdict());
            sb.append(", confidence=").append(ar.getConfidence());
            if (ar.getReason() != null) {
                sb.append(", reason=").append(ar.getReason());
            }
            sb.append("\n");
        }
        sb.append("\n请根据裁决规则进行最终判断，以JSON输出。");
        return sb.toString();
    }

    private AgentResult parseResponse(String response) {
        try {
            String json = extractJson(response);
            JsonNode node = objectMapper.readTree(json);
            String verdict = node.has("verdict") ? node.get("verdict").asText() : "FAIL";
            int confidence = node.has("confidence") ? node.get("confidence").asInt() : 0;
            String failReasons = node.has("failReasons") && !node.get("failReasons").isNull()
                    ? node.get("failReasons").asText() : null;
            return AgentResult.builder()
                    .agentName("ReviewJudge")
                    .verdict(verdict)
                    .confidence(confidence)
                    .reason(failReasons)
                    .build();
        } catch (Exception e) {
            log.error("[AI审核] judge agent JSON解析失败 raw={}", response, e);
            return AgentResult.builder()
                    .agentName("ReviewJudge")
                    .verdict("FAIL")
                    .confidence(0)
                    .reason("裁决agent输出格式异常")
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
