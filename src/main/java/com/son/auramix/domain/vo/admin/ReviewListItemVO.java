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
    private LocalDateTime createdAt;
}
