package com.son.auramix.domain.dto.user;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class PaymentSuccessDTO {

    @NotNull(message = "订单ID不能为空")
    private Long orderId;

    @NotNull(message = "交易流水号不能为空")
    private String transactionId;
}
