package com.son.auramix.domain.dto.admin;

import jakarta.validation.constraints.Min;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class MembershipPlanUpdateDTO {

    private String name;

    private String description;

    @Min(value = 1, message = "有效时长至少为1个月")
    private Integer durationMonths;

    @Min(value = 0, message = "价格不能为负数")
    private BigDecimal price;

    private BigDecimal originalPrice;

    private Integer level;

    private Integer status;

    private Integer sortOrder;
}
