package com.son.auramix.ai.progress;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

/**
 * AI 审核进度 VO：用于 SSE 推送 payload 和同步快照接口响应。
 * <p>
 * 字段含义参见 spec 3.2 节 progress_json 结构规范。
 */
@Data
public class ReviewProgressVO {

    /** SSE 事件类型：STARTED / DIMENSION_DONE / JUDGE_DONE / FINISHED / SNAPSHOT */
    private String eventType;

    private Long recordId;
    private Long trackId;
    private String trackTitle;

    private LocalDateTime startedAt;

    /** 流水线阶段：LYRICS_PHASE / DIMENSION_PHASE / JUDGE_PHASE / FINISHED */
    private String stage;

    /** 维度总数 */
    private Integer totalDimensions;
    /** 已完成维度数（status=DONE 或 FAIL） */
    private Integer completedDimensions;

    private List<DimensionProgressVO> dimensions;

    private JudgeProgressVO judge;

    private LocalDateTime finishedAt;

    /** 取自 TrackReviewRecord.status 的 int 值（1/3/5 等），FINISHED 时回填 */
    private Integer finalStatus;
    private Integer finalVerdict;
    private Integer finalConfidence;

    @Data
    public static class DimensionProgressVO {
        private String agentName;
        private String displayName;
        private Integer order;
        /** PENDING / RUNNING / DONE / FAIL */
        private String status;
        private String verdict;
        private Integer confidence;
        private String reason;
        private LocalDateTime startedAt;
        private LocalDateTime finishedAt;
        private Long durationMs;
    }

    @Data
    public static class JudgeProgressVO {
        private String status;
        private String verdict;
        private Integer confidence;
        private String reason;
        private LocalDateTime startedAt;
        private LocalDateTime finishedAt;
        private Long durationMs;
    }
}
