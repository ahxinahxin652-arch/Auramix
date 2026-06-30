package com.son.auramix.service.analytics;

import lombok.Data;

import java.time.LocalDate;

/**
 * 数据看板的时间范围参数.
 * 与方案保持一致: 解析前端传过来的 range=7d / 30d / all, 同时支持自定义 start/end.
 */
@Data
public class AnalyticsRange {

    public static final String RANGE_7D = "7d";
    public static final String RANGE_30D = "30d";
    public static final String RANGE_ALL = "all";

    private final LocalDate startDate;
    private final LocalDate endDate;
    private final String label;

    public AnalyticsRange(LocalDate startDate, LocalDate endDate, String label) {
        this.startDate = startDate;
        this.endDate = endDate;
        this.label = label;
    }

    /**
     * 解析 range 字符串. 默认 7d.
     */
    public static AnalyticsRange parse(String range) {
        LocalDate today = LocalDate.now();
        if (RANGE_30D.equalsIgnoreCase(range)) {
            return new AnalyticsRange(today.minusDays(29), today, RANGE_30D);
        }
        if (RANGE_ALL.equalsIgnoreCase(range)) {
            // 平台大概 2026-05 开始有数据, 取足够早的起点
            return new AnalyticsRange(LocalDate.of(2024, 1, 1), today, RANGE_ALL);
        }
        return new AnalyticsRange(today.minusDays(6), today, RANGE_7D);
    }

    /**
     * 解析自定义区间 (yyyy-MM-dd~yyyy-MM-dd).
     */
    public static AnalyticsRange custom(String start, String end) {
        LocalDate s = LocalDate.parse(start);
        LocalDate e = LocalDate.parse(end);
        return new AnalyticsRange(s, e, s + "~" + e);
    }
}