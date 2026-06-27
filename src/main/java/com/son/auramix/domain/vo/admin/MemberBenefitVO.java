package com.son.auramix.domain.vo.admin;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class MemberBenefitVO {
    private Long id;
    private Long planId;
    private String benefitKey;
    private String benefitValue;
    private Integer benefitType;
    private Integer status;
    private Integer sortOrder;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
