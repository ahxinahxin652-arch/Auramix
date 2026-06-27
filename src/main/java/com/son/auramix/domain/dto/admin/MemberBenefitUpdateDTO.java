package com.son.auramix.domain.dto.admin;

import lombok.Data;

@Data
public class MemberBenefitUpdateDTO {

    private String benefitKey;

    private String benefitValue;

    private Integer benefitType;

    private Integer status;

    private Integer sortOrder;
}
