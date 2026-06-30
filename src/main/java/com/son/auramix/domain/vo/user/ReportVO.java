package com.son.auramix.domain.vo.user;

import lombok.Data;

import java.util.List;

/**
 * 周期报告详情 VO.
 */
@Data
public class ReportVO {
    private Long id;
    private Long userId;
    private Integer periodType;
    private String periodTypeLabel;
    private String periodStart;
    private String periodEnd;

    private Integer status;
    private String statusLabel;
    private String errorMessage;

    /** LLM 文字总结 */
    private String summary;

    /** 心情标签 */
    private List<String> moodTags;

    /** 高光时刻 */
    private List<String> highlights;

    /** 推荐收听 */
    private List<String> recommendations;

    /** 统计快照 (JSON 字符串原文, 给前端再做可视化) */
    private String statsSnapshotJson;

    private String generatedAt;
    private String createdAt;
}