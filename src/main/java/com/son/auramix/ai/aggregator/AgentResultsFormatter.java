package com.son.auramix.ai.aggregator;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.Iterator;
import java.util.Map;

@Slf4j
@Component
@RequiredArgsConstructor
public class AgentResultsFormatter {

    private static final Map<String, String> CN_NAME = Map.of(
        "PoliticalSensitivity", "政治敏感",
        "ViolenceTerror",       "暴力恐怖",
        "ExplicitContent",      "色情低俗",
        "AntiSocial",           "反社会"
    );

    private final ObjectMapper objectMapper;

    public String formatDimensions(String agentResultsJson) {
        if (agentResultsJson == null || agentResultsJson.isBlank()) {
            return null;
        }
        try {
            JsonNode root = objectMapper.readTree(agentResultsJson);
            JsonNode dimensions = root.get("dimensions");
            if (dimensions == null || !dimensions.isArray() || dimensions.isEmpty()) {
                return null;
            }
            StringBuilder sb = new StringBuilder();
            Iterator<JsonNode> it = dimensions.elements();
            while (it.hasNext()) {
                JsonNode d = it.next();
                String agentName = d.path("agentName").asText();
                String verdict = d.path("verdict").asText();
                int confidence = d.path("confidence").asInt(0);
                String reason = d.path("reason").isMissingNode() || d.path("reason").isNull()
                    ? null : d.path("reason").asText();

                String cnName = CN_NAME.getOrDefault(agentName, agentName);
                if ("PASS".equalsIgnoreCase(verdict)) {
                    sb.append(cnName).append("审核通过：置信度").append(confidence);
                } else {
                    sb.append(cnName).append("审核未通过");
                    if (reason != null && !reason.isBlank()) {
                        sb.append("，疑是：").append(reason);
                    }
                }
                if (it.hasNext()) {
                    sb.append("；");
                }
            }
            return sb.toString();
        } catch (Exception e) {
            log.warn("[AI审核] Formatter 解析 agent_results 失败: {}", e.getMessage());
            return null;
        }
    }
}
