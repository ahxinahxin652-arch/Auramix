package com.son.auramix.domain.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 支付订单实体
 */
@Data
@TableName("payment_orders")
public class PaymentOrders {

    @TableId(type = IdType.ASSIGN_ID)
    private Long id;

    private String orderNo;

    private Long userId;

    private Long planId;

    private BigDecimal amount;

    private String currency;

    private Integer payType;

    private Integer status;

    private String payUrl;

    private LocalDateTime payTime;

    private LocalDateTime expireTime;

    private String transactionId;

    private LocalDateTime refundTime;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}