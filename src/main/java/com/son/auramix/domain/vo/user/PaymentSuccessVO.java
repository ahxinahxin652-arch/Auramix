package com.son.auramix.domain.vo.user;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 支付成功响应 VO
 */
@Data
public class PaymentSuccessVO {

    /** 订单 ID */
    private Long orderId;

    /** 订单编号 */
    private String orderNo;

    /** 支付金额 */
    private BigDecimal amount;

    /** 方案名称 */
    private String planName;

    /** 会员开始时间 */
    private LocalDateTime membershipStartDate;

    /** 会员到期时间 */
    private LocalDateTime membershipEndDate;
}
