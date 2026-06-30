package com.son.auramix.domain.vo.user;

import lombok.Data;

/**
 * 周期报告列表项.
 */
@Data
public class ReportListItemVO {
    private Long id;
    private Long userId;
    private Integer periodType;
    private String periodStart;
    private String periodEnd;
    private Integer status;
    private String statusLabel;
    private String generatedAt;
    private String title;
}