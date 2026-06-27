package com.son.auramix.domain.dto.admin;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 支付订单编辑 DTO（部分更新）
 */
@Data
public class PaymentOrderUpdateDTO {

    /** 支付金额 */
    private BigDecimal amount;

    /** 币种 */
    private String currency;

    /** 支付方式 */
    private Integer payType;

    /** 订单状态 (0-待支付, 1-已支付, 2-已取消, 3-已退款) */
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
}
