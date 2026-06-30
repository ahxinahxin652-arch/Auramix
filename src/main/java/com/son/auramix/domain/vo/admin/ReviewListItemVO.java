package com.son.auramix.domain.vo.admin;

import lombok.Data;

import java.time.LocalDateTime;

/**
 * 审核记录列表项
 */
@Data
public class ReviewListItemVO {

    private Long id;
    private Long trackId;
    private String trackTitle;
    private Integer verdict;
    private Integer confidence;
    private String failReasons;
    /** 各维度审核明细（中文），如 "政治敏感审核通过：置信度92；暴力恐怖审核未通过，疑是：xxx" */
    private String dimensionDetails;

    /** 处理状态: 0=AI审核中, 1=AI审核完成待自动处理, 2=已自动处理, 3=待人工确认, 4=人工已确认, 5=失败/异常 */
    private Integer status;

    private LocalDateTime createdAt;
}
