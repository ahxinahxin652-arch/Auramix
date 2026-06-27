package com.son.auramix.domain.dto.user;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class PaymentOrderCreateDTO {

    @NotNull(message = "方案ID不能为空")
    private Long planId;

    @NotNull(message = "支付方式不能为空")
    private Integer payType;

    /** 支付链接 */
    private String payUrl;
}
