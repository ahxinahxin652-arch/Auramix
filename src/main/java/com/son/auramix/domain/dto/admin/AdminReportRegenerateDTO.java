package com.son.auramix.domain.dto.admin;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

/**
 * Admin 强制重生成报告参数.
 */
@Data
public class AdminReportRegenerateDTO {

    @NotNull
    private Long userId;

    @NotNull
    @Min(1)
    private Integer periodType;
}