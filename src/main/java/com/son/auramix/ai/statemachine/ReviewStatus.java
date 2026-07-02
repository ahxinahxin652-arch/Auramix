package com.son.auramix.ai.statemachine;

import lombok.Getter;

/**
 * 审核流程状态枚举。
 * <p>
 * 4 个内部流水线状态({@link #PENDING}/{@link #FETCH_LYRICS}/{@link #DIMENSION_REVIEW}/{@link #JUDGE})
 * 在数据库中均映射为 status=0(AI审核中)，它们的区分由 progress_json 和运行时状态机维护。
 * 5 个终态/挂起态映射到 status=1~5，与 {@code TrackReviewRecord.status} 对齐。
 */
@Getter
public enum ReviewStatus {

    PENDING(0, "初始状态，记录已创建"),
    FETCH_LYRICS(0, "正在拉取歌词"),
    DIMENSION_REVIEW(0, "正在执行维度审核"),
    JUDGE(0, "正在裁决汇总"),
    AUTO_RESULT(1, "审核完成，高置信度，待自动处理"),
    AUTO_DONE(2, "已自动处理"),
    MANUAL_REVIEW(3, "审核完成，低置信度，待人工确认"),
    ADMIN_DONE(4, "人工已确认"),
    FAILED(5, "失败/异常");

    /** 对应 TrackReviewRecord.status 的 int 值 */
    private final int dbStatus;
    private final String description;

    ReviewStatus(int dbStatus, String description) {
        this.dbStatus = dbStatus;
        this.description = description;
    }

    /**
     * 从数据库 int status 反查状态。
     * <p>
     * 当 dbStatus=0 时无法区分具体处于哪个流水线阶段，默认返回 {@link #PENDING}。
     * 需要精确阶段时应从 progress_json 推断。
     */
    public static ReviewStatus fromDbStatus(int status) {
        return switch (status) {
            case 0 -> PENDING;
            case 1 -> AUTO_RESULT;
            case 2 -> AUTO_DONE;
            case 3 -> MANUAL_REVIEW;
            case 4 -> ADMIN_DONE;
            case 5 -> FAILED;
            default -> throw new IllegalArgumentException("Unknown review status: " + status);
        };
    }

    /** 是否为终态（不会再发生状态转换） */
    public boolean isTerminal() {
        return this == AUTO_DONE || this == ADMIN_DONE;
    }

    /** 是否处于活跃的 AI 审核流水线中（dbStatus=0） */
    public boolean isPipelineActive() {
        return this == PENDING || this == FETCH_LYRICS || this == DIMENSION_REVIEW || this == JUDGE;
    }
}
