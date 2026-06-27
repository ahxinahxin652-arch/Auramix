package com.son.auramix.service.user;

import com.son.auramix.domain.dto.user.PaymentOrderCreateDTO;
import com.son.auramix.domain.dto.user.PaymentSuccessDTO;
import com.son.auramix.domain.vo.user.PaymentOrderCreateVO;
import com.son.auramix.domain.vo.user.PaymentSuccessVO;
import com.son.auramix.domain.vo.user.UserPendingOrderVO;

import java.util.List;

public interface UserPaymentOrderService {

    /**
     * 用户点击购买，创建待支付订单
     */
    PaymentOrderCreateVO createPaymentOrder(PaymentOrderCreateDTO req);

    /**
     * 支付成功回调：更新订单状态 + 开通/续费会员
     */
    PaymentSuccessVO paymentSuccess(PaymentSuccessDTO req);

    /**
     * 获取当前用户的待支付订单列表
     */
    List<UserPendingOrderVO> listMyPendingOrders();
}
