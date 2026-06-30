package com.son.auramix.domain.vo.admin;

import lombok.Data;

/**
 * Admin 视角的报告列表项 (在 ReportListItemVO 基础上补充用户信息).
 * <p>
 * 之所以新建, 而不是改原 VO, 是为了遵守"不改动原有文件"原则.
 */
@Data
public class AdminReportListItemVO {
    private Long id;
    private Long userId;
    private String userEmail;
    private String userDisplayName;
    private Integer periodType;
    private String periodStart;
    private String periodEnd;
    private Integer status;
    private String statusLabel;
    private String generatedAt;
    private String title;
}