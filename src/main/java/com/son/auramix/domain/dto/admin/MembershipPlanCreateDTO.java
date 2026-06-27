package com.son.auramix.domain.dto.admin;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class MembershipPlanCreateDTO {

    @NotBlank(message = "方案名称不能为空")
    private String name;

    private String description;

    @NotNull(message = "有效时长不能为空")
    @Min(value = 1, message = "有效时长至少为1个月")
    private Integer durationMonths;

    @NotNull(message = "价格不能为空")
    @Min(value = 0, message = "价格不能为负数")
    private BigDecimal price;

    private BigDecimal originalPrice;

    private Integer level;

    private Integer status;

    private Integer sortOrder;
}
