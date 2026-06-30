package com.son.auramix.domain.dto.analytics;

import lombok.Data;

import java.util.List;

/**
 * 用户维度分析数据.
 */
@Data
public class UserAnalytics {

    private long totalUsers;
    private long newUsers;
    private long activeUsers;
    private long payingUsers;        // 至少有过一条订单/会员
    private double payingRatio;      // 付费比例

    /** 国家分布 TOP10 */
    private List<DistItem> countryDist;

    /** 产品渠道分布 */
    private List<DistItem> productDist;

    /** 新增趋势 */
    private List<OverviewAnalytics.TrendPoint> newUsersTrend;

    @Data
    public static class DistItem {
        private String label;
        private long count;
    }
}