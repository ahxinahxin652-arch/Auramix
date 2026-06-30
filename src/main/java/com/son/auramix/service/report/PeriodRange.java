package com.son.auramix.service.report;

import lombok.Data;

import java.time.LocalDate;

/**
 * 周期区间: 描述一次报告统计所覆盖的起止日期 + 类型
 */
@Data
public class PeriodRange {

    /** 1=周报 2=月报 */
    public static final int TYPE_WEEKLY = 1;
    public static final int TYPE_MONTHLY = 2;

    private final int periodType;
    private final LocalDate periodStart;
    private final LocalDate periodEnd;
    private final String label;

    public PeriodRange(int periodType, LocalDate periodStart, LocalDate periodEnd, String label) {
        this.periodType = periodType;
        this.periodStart = periodStart;
        this.periodEnd = periodEnd;
        this.label = label;
    }

    /**
     * 构造最近 7 天的周报区间(本周一到上周日).
     * 例如 2026-06-30 周二 → 周期 2026-06-22 ~ 2026-06-28
     */
    public static PeriodRange lastWeek() {
        LocalDate today = LocalDate.now();
        LocalDate thisMonday = today.minusDays(today.getDayOfWeek().getValue() - 1L);
        LocalDate lastSunday = thisMonday.minusDays(1);
        LocalDate lastMonday = lastSunday.minusDays(6);
        return new PeriodRange(TYPE_WEEKLY, lastMonday, lastSunday, "last-week");
    }

    /**
     * 构造最近一个自然月的月报区间(上月 1 号 ~ 上月月末).
     */
    public static PeriodRange lastMonth() {
        LocalDate today = LocalDate.now();
        LocalDate firstOfThisMonth = today.withDayOfMonth(1);
        LocalDate lastOfPrevMonth = firstOfThisMonth.minusDays(1);
        LocalDate firstOfPrevMonth = lastOfPrevMonth.withDayOfMonth(1);
        return new PeriodRange(TYPE_MONTHLY, firstOfPrevMonth, lastOfPrevMonth, "last-month");
    }
}