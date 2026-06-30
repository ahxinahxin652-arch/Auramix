package com.son.auramix.ai.aggregator;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.son.auramix.ai.dto.AgentResult;
import com.son.auramix.ai.dto.AgentResultsPayload;
import com.son.auramix.ai.dto.DimensionSummary;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * 把 4 维度 + 裁决结果拼装成 agent_results JSON。
 * 使用 Jackson 序列化（替代原 orchestrator 手写 StringBuilder），
 * 自动处理特殊字符转义。
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class AgentResultsAggregator {

    private final ObjectMapper objectMapper;

    /**
     * 拼装完整 JSON 字符串（含 dimensionSummary 概览 + dimensions 详情 + judge 裁决）。
     * @return JSON 字符串，序列化失败时抛 JsonProcessingException
     */
    public String build(List<AgentResult> dimensions, AgentResult judge) throws JsonProcessingException {
        AgentResultsPayload payload = new AgentResultsPayload();
        payload.setDimensionSummary(buildSummary(dimensions));
        payload.setDimensions(dimensions);
        payload.setJudge(judge);
        return objectMapper.writeValueAsString(payload);
    }

    private List<DimensionSummary> buildSummary(List<AgentResult> dims) {
        return dims.stream()
            .map(d -> new DimensionSummary(d.getAgentName(), d.getVerdict(), d.getConfidence()))
            .toList();
    }
}
