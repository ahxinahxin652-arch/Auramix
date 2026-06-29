package com.son.auramix.controller.user;

import com.son.auramix.common.result.Result;
import com.son.auramix.domain.dto.admin.PaymentOrderUpdateDTO;
import com.son.auramix.domain.dto.user.PaymentOrderCreateDTO;
import com.son.auramix.domain.dto.user.PaymentSuccessDTO;
import com.son.auramix.domain.vo.admin.MembershipPlanVO;
import com.son.auramix.domain.vo.user.CurrentUserMembershipVO;
import com.son.auramix.domain.vo.user.PaymentOrderCreateVO;
import com.son.auramix.domain.vo.user.PaymentSuccessVO;
import com.son.auramix.domain.vo.user.UserPendingOrderVO;
import com.son.auramix.service.admin.MemberPlanService;
import com.son.auramix.service.admin.PaymentOrderService;
import com.son.auramix.service.user.UserMembershipService;
import com.son.auramix.service.user.UserPaymentOrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/user/manage/member")
@RequiredArgsConstructor
@PreAuthorize("hasAnyAuthority('ROOT_ADMIN', 'USER')")
public class UserMemberManageController {

    private final MemberPlanService memberPlanService;
    private final UserPaymentOrderService userPaymentOrderService;
    private final UserMembershipService userMembershipService;
    private final PaymentOrderService paymentOrderService;

    @GetMapping("/plans")
    public Result<List<MembershipPlanVO>> listPlans() {
        return Result.success(memberPlanService.listPlans());
    }

    @PostMapping("/createOrder")
    public Result<PaymentOrderCreateVO> createOrder(@Valid @RequestBody PaymentOrderCreateDTO req) {
        return Result.success(userPaymentOrderService.createPaymentOrder(req));
    }

    @PutMapping("/paymentOrders/{id}")
    public Result<Void> updatePaymentOrder(@PathVariable Long id, @Valid @RequestBody PaymentOrderUpdateDTO req) {
        paymentOrderService.updatePaymentOrder(id, req);
        return Result.success();
    }

    @PostMapping("/paymentSuccess")
    public Result<PaymentSuccessVO> paymentSuccess(@Valid @RequestBody PaymentSuccessDTO req) {
        return Result.success(userPaymentOrderService.paymentSuccess(req));
    }

    @GetMapping("/myMembership")
    public Result<List<CurrentUserMembershipVO>> myMembership() {
        return Result.success(userMembershipService.getCurrentUserMemberships());
    }

    @GetMapping("/pendingOrders")
    public Result<List<UserPendingOrderVO>> pendingOrders() {
        return Result.success(userPaymentOrderService.listMyPendingOrders());
    }
}
