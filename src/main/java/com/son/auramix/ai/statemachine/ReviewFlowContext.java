package com.son.auramix.ai.statemachine;

import com.son.auramix.ai.dto.AgentResult;
import com.son.auramix.ai.dto.ReviewContext;
import com.son.auramix.ai.agent.DimensionAgent;
import lombok.Getter;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

/**
 * 审核流程上下文：在状态机驱动的流水线中携带全量中间状态。
 * <p>
 * 生命周期：从 {@link ReviewStatus#PENDING} 开始，随状态机推进逐步填充，
 * 终态时包含完整的 dimensionResults + finalResult + agentResultsJson。
 * <p>
 * 线程不安全（与 {@link ReviewStateMachine} 一致），每次审核流程独立创建。
 */
@Getter
@Setter
public class ReviewFlowContext {

    private final ReviewStateMachine stateMachine;
    private final ReviewContext reviewContext;
    private final Long recordId;

    /** 排序后的维度 agent 列表（PENDING → FETCH_LYRICS 阶段填充） */
    private List<DimensionAgent> sortedAgents;

    /** 维度审核结果列表（DIMENSION_REVIEW 阶段逐步填充） */
    private List<AgentResult> dimensionResults = new ArrayList<>();

    /** 最终裁决结果（JUDGE 阶段填充） */
    private AgentResult finalResult;

    /** 聚合后的 agent_results JSON 字符串（JUDGE 完成后填充） */
    private String agentResultsJson;

    public ReviewFlowContext(ReviewStateMachine stateMachine, ReviewContext reviewContext, Long recordId) {
        this.stateMachine = stateMachine;
        this.reviewContext = reviewContext;
        this.recordId = recordId;
    }
}
