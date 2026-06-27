package com.son.auramix.domain.vo.user;

import com.son.auramix.domain.vo.admin.MemberBenefitVO;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

/**
 * 当前用户会员订阅信息 VO（含方案信息 + 权益列表 + 订阅有效期）
 */
@Data
public class CurrentUserMembershipVO {

    /** 会员订阅 ID */
    private Long membershipId;

    /** 方案 ID */
    private Long planId;

    /** 方案名称 */
    private String planName;

    /** 方案描述 */
    private String planDescription;

    /** 方案等级 */
    private Integer planLevel;

    /** 原价 */
    private BigDecimal originalPrice;

    /** 现价 */
    private BigDecimal price;

    /** 方案周期（月） */
    private Integer durationMonths;

    /** 会员开始时间 */
    private LocalDateTime startDate;

    /** 会员到期时间 */
    private LocalDateTime endDate;

    /** 方案下的权益列表 */
    private List<MemberBenefitVO> benefits;
}
