package com.son.auramix.ai.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 单个 agent 的审核输出结果
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AgentResult {

    /** agent 名称 */
    private String agentName;

    /** PASS | FAIL | PENDING（PENDING 表示审核异常，转人工确认） */
    private String verdict;

    /** 置信度 0-100 */
    private Integer confidence;

    /** 不通过原因（PASS 时为 null） */
    private String reason;

    /** 思维链分析过程：逐条对照审核标准的正向分析，引用原文片段。供 judge agent 跨维度纠偏参考。 */
    private String analysis;

    /** 反面论证（Chain-of-Verification）：尝试为内容辩护，思考豁免/艺术表达/语境正当等可能。供 judge agent 纠偏参考。 */
    private String counterArgument;

    public boolean isFail() {
        return "FAIL".equalsIgnoreCase(verdict);
    }

    public boolean isPass() {
        return "PASS".equalsIgnoreCase(verdict);
    }

    public boolean isPending() {
        return "PENDING".equalsIgnoreCase(verdict);
    }
}
