package com.son.auramix.domain.dto.admin;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class MemberBenefitCreateDTO {

    @NotNull(message = "所属方案ID不能为空")
    private Long planId;

    @NotBlank(message = "权益标识不能为空")
    private String benefitKey;

    @NotBlank(message = "权益名称不能为空")
    private String benefitValue;

    private Integer benefitType;

    private Integer status;

    private Integer sortOrder;
}
