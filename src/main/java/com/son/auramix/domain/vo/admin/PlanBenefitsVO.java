package com.son.auramix.domain.vo.admin;

import lombok.Data;

import java.util.List;

@Data
public class PlanBenefitsVO {
    private Long planId;
    private List<MemberBenefitVO> benefits;
}
