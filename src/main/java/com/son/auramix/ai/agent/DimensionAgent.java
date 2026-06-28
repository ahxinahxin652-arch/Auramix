package com.son.auramix.ai.agent;

/**
 * 维度审核 Agent 接口：在 ReviewAgent 基础上扩展 getCriteria()，
 * 让 AbstractDimensionAgent.buildPrompt 能注入本维度的具体审查条目到 user prompt。
 */
public interface DimensionAgent extends ReviewAgent {
    /**
     * 本维度具体的审核标准（条目化、清晰可枚举）。
     * 将注入到 user prompt 的 "请从以下维度进行判断：" 之后的部分。
     */
    String getCriteria();
}
