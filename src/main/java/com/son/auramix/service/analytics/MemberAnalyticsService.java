package com.son.auramix.service.analytics;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.son.auramix.domain.dto.analytics.MemberAnalytics;
import com.son.auramix.domain.entity.MembershipPlans;
import com.son.auramix.domain.entity.PaymentOrders;
import com.son.auramix.domain.entity.UserMemberships;
import com.son.auramix.mapper.MembershipPlansMapper;
import com.son.auramix.mapper.PaymentOrdersMapper;
import com.son.auramix.mapper.UserMembershipsMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * 会员 / 订单维度分析.
 * <p>
 * 套餐销售 (按 plan_id 聚合), 营收趋势, 活跃会员数, ARPU.
 */
@Service
@RequiredArgsConstructor
public class MemberAnalyticsService {

    private final PaymentOrdersMapper paymentOrdersMapper;
    private final MembershipPlansMapper membershipPlansMapper;
    private final UserMembershipsMapper userMembershipsMapper;
    private final AnalyticsCacheService cacheService;

    private static final String CACHE_MODULE = "members";

    public MemberAnalytics compute(AnalyticsRange range, boolean forceRefresh) {
        return cacheService.getOrCompute(
                CACHE_MODULE,
                range.getLabel(),
                null,
                forceRefresh,
                () -> doCompute(range)
        );
    }

    private MemberAnalytics doCompute(AnalyticsRange range) {
        MemberAnalytics data = new MemberAnalytics();
        LocalDateTime start = range.getStartDate().atStartOfDay();
        LocalDateTime end = range.getEndDate().plusDays(1).atStartOfDay();

        // 1. 周期内全部订单
        List<PaymentOrders> orders = paymentOrdersMapper.selectList(
                new LambdaQueryWrapper<PaymentOrders>()
                        .between(PaymentOrders::getCreatedAt, start, end));

        // 2. 按 plan_id 聚合销售
        Map<Long, List<PaymentOrders>> byPlan = orders.stream()
                .filter(o -> o.getPlanId() != null)
                .collect(Collectors.groupingBy(PaymentOrders::getPlanId));

        // 3. 拉套餐名称
        List<Long> planIds = new ArrayList<>(byPlan.keySet());
        Map<Long, MembershipPlans> planMap = planIds.isEmpty() ? new HashMap<>()
                : membershipPlansMapper.selectBatchIds(planIds).stream()
                .collect(Collectors.toMap(MembershipPlans::getId, p -> p, (x, y) -> x));

        List<MemberAnalytics.PlanSalesItem> planSales = new ArrayList<>();
        BigDecimal totalRevenue = BigDecimal.ZERO;
        for (Map.Entry<Long, List<PaymentOrders>> e : byPlan.entrySet()) {
            Long planId = e.getKey();
            List<PaymentOrders> list = e.getValue();
            BigDecimal sum = list.stream()
                    .map(PaymentOrders::getAmount)
                    .filter(java.util.Objects::nonNull)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            totalRevenue = totalRevenue.add(sum);

            MemberAnalytics.PlanSalesItem item = new MemberAnalytics.PlanSalesItem();
            item.setPlanId(planId);
            MembershipPlans plan = planMap.get(planId);
            item.setPlanName(plan == null ? "未知套餐(" + planId + ")" : plan.getName());
            item.setSoldCount((long) list.size());
            item.setRevenue(sum);
            planSales.add(item);
        }
        planSales.sort((a, b) -> b.getRevenue().compareTo(a.getRevenue()));
        data.setPlanSales(planSales);
        data.setTotalRevenue(totalRevenue);

        // 4. 活跃会员数 (当前有效)
        List<UserMemberships> activeMembers = userMembershipsMapper.selectList(
                new LambdaQueryWrapper<UserMemberships>().eq(UserMemberships::getStatus, 1));
        data.setActiveMembers(activeMembers.size());

        // 5. ARPU = revenue / payingUsers (本周期内有过订单的去重 user 数)
        long payingUsers = orders.stream()
                .map(PaymentOrders::getUserId)
                .filter(java.util.Objects::nonNull)
                .distinct()
                .count();
        if (payingUsers > 0) {
            data.setArpu(totalRevenue.divide(BigDecimal.valueOf(payingUsers), 2, RoundingMode.HALF_UP));
        } else {
            data.setArpu(BigDecimal.ZERO);
        }

        // 6. 营收趋势 (按天)
        Map<LocalDate, BigDecimal> revenueByDay = new HashMap<>();
        for (PaymentOrders o : orders) {
            if (o.getCreatedAt() == null || o.getAmount() == null) continue;
            revenueByDay.merge(o.getCreatedAt().toLocalDate(), o.getAmount(), BigDecimal::add);
        }
        List<MemberAnalytics.RevenuePoint> revenueTrend = new ArrayList<>();
        LocalDate cursor = range.getStartDate();
        while (!cursor.isAfter(range.getEndDate())) {
            MemberAnalytics.RevenuePoint p = new MemberAnalytics.RevenuePoint();
            p.setDate(cursor.toString());
            p.setAmount(revenueByDay.getOrDefault(cursor, BigDecimal.ZERO));
            revenueTrend.add(p);
            cursor = cursor.plusDays(1);
        }
        data.setRevenueTrend(revenueTrend);

        return data;
    }
}