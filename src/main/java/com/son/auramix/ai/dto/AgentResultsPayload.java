package com.son.auramix.ai.dto;

import lombok.Data;

import java.util.List;

/**
 * agent_results JSON 的根结构。
 * 写入数据库时整个对象序列化为 JSON 字符串存入 TrackReviewRecord.agentResults (TEXT)。
 */
@Data
public class AgentResultsPayload {
    /** 新增：每维度概览（精简字段） */
    private List<DimensionSummary> dimensionSummary;
    /** 完整 4 维度详情（含 reason） */
    private List<AgentResult> dimensions;
    /** 裁决详情 */
    private AgentResult judge;
}
