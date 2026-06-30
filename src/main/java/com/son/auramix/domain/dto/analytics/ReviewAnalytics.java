package com.son.auramix.domain.dto.analytics;

import lombok.Data;

import java.util.List;

/**
 * 审核维度分析数据.
 */
@Data
public class ReviewAnalytics {

    private long totalRecords;
    private long aiPassed;          // verdict=1
    private long aiRejected;        // verdict=-1
    private long pending;           // verdict=0
    private long humanPending;      // verdict=-2
    private long humanConfirmed;    // status=4

    private double aiPassRate;      // (aiPassed / totalRecords) * 100

    /** 按 verdict 分布 */
    private List<DistItem> verdictDist;

    /** 趋势: 每日审核记录数 */
    private List<OverviewAnalytics.TrendPoint> trend;

    @Data
    public static class DistItem {
        private Integer verdict;
        private String label;
        private long count;
    }
}