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

    /** PASS | FAIL */
    private String verdict;

    /** 置信度 0-100 */
    private Integer confidence;

    /** 不通过原因（PASS 时为 null） */
    private String reason;

    public boolean isFail() {
        return "FAIL".equalsIgnoreCase(verdict);
    }

    public boolean isPass() {
        return "PASS".equalsIgnoreCase(verdict);
    }
}
