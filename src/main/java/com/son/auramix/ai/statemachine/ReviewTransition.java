package com.son.auramix.ai.statemachine;

import lombok.Getter;

/**
 * 审核流程状态转换事件。
 * <p>
 * 每个事件定义了合法的 source → target 状态对，
 * 状态机据此校验转换是否合法。
 * <p>
 * {@link #ADMIN_CONFIRM} 和 {@link #FAIL} 为通配转换（source=null），
 * 由 {@link ReviewStateMachine} 按特殊规则判定合法性。
 */
@Getter
public enum ReviewTransition {

    // ---- 流水线推进 ----
    START_FETCH_LYRICS(ReviewStatus.PENDING, ReviewStatus.FETCH_LYRICS, "开始拉取歌词"),
    LYRICS_FETCHED(ReviewStatus.FETCH_LYRICS, ReviewStatus.DIMENSION_REVIEW, "歌词拉取完成，进入维度审核"),
    START_JUDGE(ReviewStatus.DIMENSION_REVIEW, ReviewStatus.JUDGE, "维度审核完成，进入裁决汇总"),

    // ---- 裁决完成分流 ----
    JUDGE_COMPLETED_HIGH_CONF(ReviewStatus.JUDGE, ReviewStatus.AUTO_RESULT, "裁决完成，高置信度，待自动处理"),
    JUDGE_COMPLETED_LOW_CONF(ReviewStatus.JUDGE, ReviewStatus.MANUAL_REVIEW, "裁决完成，低置信度，待人工确认"),

    // ---- 短路：维度异常直接转人工 ----
    DIMENSION_PENDING_SHORT_CIRCUIT(ReviewStatus.DIMENSION_REVIEW, ReviewStatus.MANUAL_REVIEW, "维度异常，短路转人工确认"),

    // ---- 短路：维度高置信度 FAIL → 跳过 judge，直接自动处理 ----
    DIMENSION_HIGH_CONF_FAIL(ReviewStatus.DIMENSION_REVIEW, ReviewStatus.AUTO_RESULT, "维度高置信度FAIL，短路自动处理"),

    // ---- 自动处理 ----
    AUTO_PROCESS(ReviewStatus.AUTO_RESULT, ReviewStatus.AUTO_DONE, "定时任务自动处理完成"),

    // ---- 重试 ----
    RETRY(ReviewStatus.FAILED, ReviewStatus.PENDING, "重试审核"),

    // ---- 通配转换（source=null，由状态机特殊判定）----
    /** 管理员人工确认：可从任何非 ADMIN_DONE 状态转入 */
    ADMIN_CONFIRM(null, ReviewStatus.ADMIN_DONE, "管理员人工确认"),
    /** 审核流程异常失败：可从任何活跃流水线状态转入 */
    FAIL(null, ReviewStatus.FAILED, "审核流程异常");

    private final ReviewStatus source;
    private final ReviewStatus target;
    private final String description;

    ReviewTransition(ReviewStatus source, ReviewStatus target, String description) {
        this.source = source;
        this.target = target;
        this.description = description;
    }

    /** 是否为通配转换（source=null，需特殊判定） */
    public boolean isWildcard() {
        return source == null;
    }
}
