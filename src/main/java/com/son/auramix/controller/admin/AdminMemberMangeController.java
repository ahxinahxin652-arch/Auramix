package com.son.auramix.controller.admin;

import com.son.auramix.common.result.Result;
import com.son.auramix.domain.dto.admin.MemberBenefitCreateDTO;
import com.son.auramix.domain.dto.admin.MemberBenefitUpdateDTO;
import com.son.auramix.domain.dto.admin.MembershipPlanCreateDTO;
import com.son.auramix.domain.dto.admin.MembershipPlanUpdateDTO;
import com.son.auramix.domain.dto.admin.PaymentOrderUpdateDTO;
import com.son.auramix.domain.vo.admin.MembershipPlanVO;
import com.son.auramix.domain.vo.admin.PlanBenefitsVO;
import com.son.auramix.domain.vo.admin.PaymentOrderVO;
import com.son.auramix.domain.vo.user.UserMembershipVO;
import com.son.auramix.service.admin.MemberPlanService;
import com.son.auramix.service.admin.PaymentOrderService;
import com.son.auramix.service.user.UserMembershipService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/manage/member")
@RequiredArgsConstructor
@PreAuthorize("hasAnyAuthority('ROOT_ADMIN')")
public class AdminMemberMangeController {

    private final MemberPlanService memberPlanService;
    private final UserMembershipService userMembershipService;
    private final PaymentOrderService paymentOrderService;

    @GetMapping("/plans")
    public Result<List<MembershipPlanVO>> listPlans() {
        return Result.success(memberPlanService.listPlans());
    }

    @PostMapping("/addPlans")
    public Result<Void> createPlan(@Valid @RequestBody MembershipPlanCreateDTO req) {
        memberPlanService.createPlan(req);
        return Result.success();
    }

    @PutMapping("/editPlans/{id}")
    public Result<Void> updatePlan(@PathVariable Long id, @Valid @RequestBody MembershipPlanUpdateDTO req) {
        memberPlanService.updatePlan(id, req);
        return Result.success();
    }

    @GetMapping("/plans/{planId}/benefits")
    public Result<PlanBenefitsVO> listBenefits(@PathVariable Long planId) {
        return Result.success(memberPlanService.listBenefitsByPlanId(planId));
    }

    @PostMapping("/addBenefits")
    public Result<Void> createBenefit(@Valid @RequestBody MemberBenefitCreateDTO req) {
        memberPlanService.createBenefit(req);
        return Result.success();
    }

    @PutMapping("/editBenefits/{id}")
    public Result<Void> updateBenefit(@PathVariable Long id, @Valid @RequestBody MemberBenefitUpdateDTO req) {
        memberPlanService.updateBenefit(id, req);
        return Result.success();
    }

    @GetMapping("/userMemberships")
    public Result<List<UserMembershipVO>> listUserMemberships() {
        return Result.success(userMembershipService.listAllUserMemberships());
    }

    @PutMapping("/userMemberships/{id}/expire")
    public Result<Void> expireMembership(@PathVariable Long id) {
        userMembershipService.expireMembership(id);
        return Result.success();
    }

    @GetMapping("/paymentOrders")
    public Result<List<PaymentOrderVO>> listPaymentOrders() {
        return Result.success(paymentOrderService.listAllPaymentOrders());
    }

    @PutMapping("/paymentOrders/{id}")
    public Result<Void> updatePaymentOrder(@PathVariable Long id, @Valid @RequestBody PaymentOrderUpdateDTO req) {
        paymentOrderService.updatePaymentOrder(id, req);
        return Result.success();
    }

}
