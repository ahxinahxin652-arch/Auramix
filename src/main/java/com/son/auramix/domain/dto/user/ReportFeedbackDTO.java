package com.son.auramix.domain.dto.user;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

/**
 * 报告反馈提交参数.
 */
@Data
public class ReportFeedbackDTO {

    @NotNull
    private Long reportId;

    @NotNull
    @Min(1)
    @Max(2)
    private Integer rating;

    private String comment;
}