package com.son.auramix.service.admin;

import com.son.auramix.domain.dto.admin.PaymentOrderSearchDTO;
import com.son.auramix.domain.dto.admin.PaymentOrderUpdateDTO;
import com.son.auramix.domain.dto.common.PageDTO;
import com.son.auramix.domain.vo.admin.PaymentOrderVO;
import com.son.auramix.domain.vo.common.PageResult;

public interface PaymentOrderService {

    /**
     * 分页获取支付订单（含用户信息和方案名称）
     */
    PageResult<PaymentOrderVO> listAllPaymentOrders(PageDTO pageDTO);

    /**
     * 根据邮箱（精确匹配）、支付方式、支付状态分页搜索支付订单
     */
    PageResult<PaymentOrderVO> searchPaymentOrders(PaymentOrderSearchDTO dto);

    /**
     * 编辑支付订单（部分更新）
     */
    void updatePaymentOrder(Long id, PaymentOrderUpdateDTO req);
}
