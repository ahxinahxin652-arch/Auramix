package com.son.auramix.domain.vo.user;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 用户会员信息响应 VO（含用户信息 + 方案信息 + 会员有效期）
 */
@Data
public class UserMembershipVO {

    /** 用户 ID */
    private Long userId;

    /** 用户昵称 */
    private String displayName;

    /** 用户邮箱 */
    private String email;

    /** 用户头像 */
    private String avatarUrl;

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

    /** 生效开始时间 */
    private LocalDateTime startDate;

    /** 生效结束时间 */
    private LocalDateTime endDate;

    /** 购买次数（同一方案合并后的次数） */
    private Integer purchaseCount;
}
