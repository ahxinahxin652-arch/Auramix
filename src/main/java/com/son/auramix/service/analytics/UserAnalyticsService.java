package com.son.auramix.service.analytics;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.son.auramix.domain.dto.analytics.OverviewAnalytics;
import com.son.auramix.domain.dto.analytics.UserAnalytics;
import com.son.auramix.domain.entity.PlaybackHistory;
import com.son.auramix.domain.entity.User;
import com.son.auramix.domain.entity.UserMemberships;
import com.son.auramix.mapper.PlaybackHistoryMapper;
import com.son.auramix.mapper.UserMapper;
import com.son.auramix.mapper.UserMembershipsMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 用户维度分析: 总量/活跃/付费 + 国家/产品分布 + 新增趋势.
 */
@Service
@RequiredArgsConstructor
public class UserAnalyticsService {

    private final UserMapper userMapper;
    private final PlaybackHistoryMapper playbackHistoryMapper;
    private final UserMembershipsMapper userMembershipsMapper;
    private final AnalyticsCacheService cacheService;

    private static final String CACHE_MODULE = "users";

    public UserAnalytics compute(AnalyticsRange range, boolean forceRefresh) {
        return cacheService.getOrCompute(
                CACHE_MODULE,
                range.getLabel(),
                null,
                forceRefresh,
                () -> doCompute(range)
        );
    }

    private UserAnalytics doCompute(AnalyticsRange range) {
        UserAnalytics data = new UserAnalytics();
        LocalDateTime start = range.getStartDate().atStartOfDay();
        LocalDateTime end = range.getEndDate().plusDays(1).atStartOfDay();

        // 1. 总量
        data.setTotalUsers(userMapper.selectCount(null));

        // 2. 周期内新增
        data.setNewUsers(userMapper.selectCount(
                new LambdaQueryWrapper<User>().between(User::getCreatedAt, start, end)));

        // 3. 周期内活跃
        List<PlaybackHistory> activeHistories = playbackHistoryMapper.selectList(
                new LambdaQueryWrapper<PlaybackHistory>()
                        .select(PlaybackHistory::getUserId)
                        .between(PlaybackHistory::getPlayedAt, start, end));
        data.setActiveUsers(activeHistories.stream()
                .map(PlaybackHistory::getUserId)
                .filter(java.util.Objects::nonNull)
                .distinct()
                .count());

        // 4. 付费用户: 至少有一条 memberships 记录的用户
        List<UserMemberships> allMemberships = userMembershipsMapper.selectList(null);
        data.setPayingUsers(allMemberships.stream()
                .map(UserMemberships::getUserId)
                .filter(java.util.Objects::nonNull)
                .distinct()
                .count());

        // 5. 付费比例
        data.setPayingRatio(data.getTotalUsers() == 0 ? 0d
                : Math.round(data.getPayingUsers() * 10000d / data.getTotalUsers()) / 100d);

        // 6. 国家分布 TOP10
        data.setCountryDist(buildCountryDist());

        // 7. 产品渠道分布
        data.setProductDist(buildProductDist());

        // 8. 新增趋势
        data.setNewUsersTrend(buildNewUsersTrend(range, start, end));

        return data;
    }

    private List<UserAnalytics.DistItem> buildCountryDist() {
        // MyBatis-Plus 没有原生 GROUP BY, 全部拉回内存聚合
        List<User> users = userMapper.selectList(
                new LambdaQueryWrapper<User>()
                        .select(User::getCountry)
                        .isNotNull(User::getCountry)
                        .ne(User::getCountry, ""));

        Map<String, Long> count = new HashMap<>();
        for (User u : users) {
            count.merge(u.getCountry(), 1L, Long::sum);
        }
        return count.entrySet().stream()
                .sorted(Map.Entry.<String, Long>comparingByValue().reversed())
                .limit(10)
                .map(e -> {
                    UserAnalytics.DistItem item = new UserAnalytics.DistItem();
                    item.setLabel(e.getKey());
                    item.setCount(e.getValue());
                    return item;
                })
                .collect(java.util.stream.Collectors.toList());
    }

    private List<UserAnalytics.DistItem> buildProductDist() {
        List<User> users = userMapper.selectList(
                new LambdaQueryWrapper<User>().select(User::getProduct));
        Map<Integer, Long> count = new HashMap<>();
        for (User u : users) {
            Integer p = u.getProduct();
            if (p != null) count.merge(p, 1L, Long::sum);
        }
        List<UserAnalytics.DistItem> list = new ArrayList<>();
        count.forEach((k, v) -> {
            UserAnalytics.DistItem item = new UserAnalytics.DistItem();
            item.setLabel(productLabel(k));
            item.setCount(v);
            list.add(item);
        });
        list.sort((a, b) -> Long.compare(b.getCount(), a.getCount()));
        return list;
    }

    private String productLabel(Integer product) {
        if (product == null) return "未知";
        return switch (product) {
            case 0 -> "Web";
            case 1 -> "Desktop";
            case 2 -> "Mobile";
            default -> "其他(" + product + ")";
        };
    }

    private List<OverviewAnalytics.TrendPoint> buildNewUsersTrend(AnalyticsRange range, LocalDateTime start, LocalDateTime end) {
        List<User> all = userMapper.selectList(
                new LambdaQueryWrapper<User>()
                        .select(User::getCreatedAt)
                        .between(User::getCreatedAt, start, end));

        Map<LocalDate, Long> byDay = new HashMap<>();
        for (User u : all) {
            if (u.getCreatedAt() == null) continue;
            LocalDate d = u.getCreatedAt().toLocalDate();
            byDay.merge(d, 1L, Long::sum);
        }
        List<OverviewAnalytics.TrendPoint> list = new ArrayList<>();
        LocalDate cursor = range.getStartDate();
        while (!cursor.isAfter(range.getEndDate())) {
            OverviewAnalytics.TrendPoint p = new OverviewAnalytics.TrendPoint();
            p.setDate(cursor.toString());
            p.setValue(byDay.getOrDefault(cursor, 0L));
            list.add(p);
            cursor = cursor.plusDays(1);
        }
        return list;
    }
}