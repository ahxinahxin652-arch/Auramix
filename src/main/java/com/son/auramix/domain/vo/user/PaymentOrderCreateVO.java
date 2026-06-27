package com.son.auramix.domain.vo.user;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 创建支付订单响应 VO
 */
@Data
public class PaymentOrderCreateVO {

    /** 订单 ID */
    private Long id;

    /** 订单编号 */
    private String orderNo;

    /** 支付金额 */
    private BigDecimal amount;

    /** 币种 */
    private String currency;

    /** 支付链接 */
    private String payUrl;

    /** 订单过期时间 */
    private LocalDateTime expireTime;
}
