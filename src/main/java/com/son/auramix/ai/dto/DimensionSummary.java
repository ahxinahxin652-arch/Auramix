package com.son.auramix.ai.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 单维度审核概览：精简字段（仅含 name/verdict/confidence），
 * 用于 agent_results JSON 的 dimensionSummary[] 数组元素。
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class DimensionSummary {
    private String agentName;
    private String verdict;
    private Integer confidence;
}
