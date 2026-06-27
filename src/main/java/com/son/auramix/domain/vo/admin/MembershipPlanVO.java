package com.son.auramix.domain.vo.admin;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class MembershipPlanVO {
    private Long id;
    private String name;
    private String description;
    private Integer durationMonths;
    private BigDecimal price;
    private BigDecimal originalPrice;
    private Integer level;
    private Integer status;
    private Integer sortOrder;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    /** 方案下的会员权益列表 */
    private List<MemberBenefitVO> benefits;
}
