package com.son.auramix.domain.dto.analytics;

import lombok.Data;

/**
 * 下钻明细条目.
 */
@Data
public class AnalyticsDrillItem {
    private String module;       // tracks / albums / artists / users / orders
    private Long id;
    private String name;
    private String extra;        // JSON / 备注
    private long value;
    private String occurredAt;
}