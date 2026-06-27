package com.son.auramix.service.admin;

import com.son.auramix.domain.dto.admin.PaymentOrderUpdateDTO;
import com.son.auramix.domain.vo.admin.PaymentOrderVO;

import java.util.List;

public interface PaymentOrderService {

    /**
     * 获取所有用户支付订单（含用户信息和方案名称）
     */
    List<PaymentOrderVO> listAllPaymentOrders();

    /**
     * 编辑支付订单（部分更新）
     */
    void updatePaymentOrder(Long id, PaymentOrderUpdateDTO req);
}
