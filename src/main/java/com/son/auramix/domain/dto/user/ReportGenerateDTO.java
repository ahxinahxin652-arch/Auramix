package com.son.auramix.domain.dto.user;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

/**
 * 周期报告手动触发生成参数.
 */
@Data
public class ReportGenerateDTO {

    @NotNull
    @Min(1)
    private Integer periodType;

    /** 可选: 不传则按 periodType 取上一个完整周期 */
    private String periodStart;
    private String periodEnd;
}