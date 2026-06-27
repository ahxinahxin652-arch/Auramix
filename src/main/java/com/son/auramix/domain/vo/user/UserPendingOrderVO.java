package com.son.auramix.domain.vo.user;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 用户待支付订单 VO
 */
@Data
public class UserPendingOrderVO {

    /** 订单 ID */
    private Long id;

    /** 订单编号 */
    private String orderNo;

    /** 方案 ID */
    private Long planId;

    /** 方案名称 */
    private String planName;

    /** 支付金额 */
    private BigDecimal amount;

    /** 币种 */
    private String currency;

    /** 支付方式 */
    private Integer payType;

    /** 订单状态 */
    private Integer status;

    /** 支付链接 */
    private String payUrl;

    /** 订单过期时间 */
    private LocalDateTime expireTime;

    /** 创建时间 */
    private LocalDateTime createdAt;
}
