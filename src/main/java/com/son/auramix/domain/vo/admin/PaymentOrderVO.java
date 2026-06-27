package com.son.auramix.domain.vo.admin;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 支付订单响应 VO（含用户信息 + 方案名称）
 */
@Data
public class PaymentOrderVO {

    /** 订单 ID */
    private Long id;

    /** 订单编号 */
    private String orderNo;

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

    /** 支付时间 */
    private LocalDateTime payTime;

    /** 订单过期时间 */
    private LocalDateTime expireTime;

    /** 交易流水号 */
    private String transactionId;

    /** 退款时间 */
    private LocalDateTime refundTime;

    /** 创建时间 */
    private LocalDateTime createdAt;

    /** 更新时间 */
    private LocalDateTime updatedAt;
}
