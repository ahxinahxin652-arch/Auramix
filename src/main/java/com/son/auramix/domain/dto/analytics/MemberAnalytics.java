package com.son.auramix.domain.dto.analytics;

import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

/**
 * 会员 / 订单维度分析数据.
 */
@Data
public class MemberAnalytics {

    /** 套餐销售: 按 plan_id 聚合 */
    private List<PlanSalesItem> planSales;

    /** 订单金额 (周期内) */
    private BigDecimal totalRevenue;

    /** ARPU = revenue / payingUsers */
    private BigDecimal arpu;

    /** 活跃会员数 (status=1) */
    private long activeMembers;

    /** 趋势: 每日订单金额 */
    private List<RevenuePoint> revenueTrend;

    @Data
    public static class PlanSalesItem {
        private Long planId;
        private String planName;
        private long soldCount;
        private BigDecimal revenue;
    }

    @Data
    public static class RevenuePoint {
        private String date;          // yyyy-MM-dd
        private BigDecimal amount;
    }
}