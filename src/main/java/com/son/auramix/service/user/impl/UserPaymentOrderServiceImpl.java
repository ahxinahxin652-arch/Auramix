package com.son.auramix.service.user.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.son.auramix.common.exception.BusinessException;
import com.son.auramix.common.result.ResultCode;
import com.son.auramix.domain.dto.user.PaymentOrderCreateDTO;
import com.son.auramix.domain.dto.user.PaymentSuccessDTO;
import com.son.auramix.domain.entity.MembershipPlans;
import com.son.auramix.domain.entity.PaymentOrders;
import com.son.auramix.domain.entity.User;
import com.son.auramix.domain.entity.UserMemberships;
import com.son.auramix.domain.vo.user.PaymentOrderCreateVO;
import com.son.auramix.domain.vo.user.PaymentSuccessVO;
import com.son.auramix.domain.vo.user.UserPendingOrderVO;
import com.son.auramix.mapper.MembershipPlansMapper;
import com.son.auramix.mapper.PaymentOrdersMapper;
import com.son.auramix.mapper.UserMapper;
import com.son.auramix.mapper.UserMembershipsMapper;
import com.son.auramix.security.user.UserPrincipal;
import com.son.auramix.service.user.UserPaymentOrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.concurrent.ThreadLocalRandom;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserPaymentOrderServiceImpl implements UserPaymentOrderService {

    private final PaymentOrdersMapper paymentOrdersMapper;
    private final MembershipPlansMapper membershipPlansMapper;
    private final UserMapper userMapper;
    private final UserMembershipsMapper userMembershipsMapper;

    private static final DateTimeFormatter ORDER_DATE_FORMAT = DateTimeFormatter.ofPattern("yyyyMMddHHmmss");

    @Override
    @Transactional
    public PaymentOrderCreateVO createPaymentOrder(PaymentOrderCreateDTO req) {
        Long userId = getCurrentUserId();

        // 校验方案是否存在且启用
        MembershipPlans plan = membershipPlansMapper.selectById(req.getPlanId());
        if (plan == null) {
            throw new BusinessException(ResultCode.BAD_REQUEST, "会员方案不存在");
        }
        if (plan.getStatus() != null && plan.getStatus() != 1) {
            throw new BusinessException(ResultCode.BAD_REQUEST, "该会员方案已下架");
        }

        // 金额取自方案定价，防止客户端篡改
        BigDecimal amount = plan.getPrice();
        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new BusinessException(ResultCode.BAD_REQUEST, "方案价格异常");
        }

        LocalDateTime now = LocalDateTime.now();
        String orderNo = generateOrderNo(userId);

        PaymentOrders order = new PaymentOrders();
        order.setOrderNo(orderNo);
        order.setUserId(userId);
        order.setPlanId(req.getPlanId());
        order.setAmount(amount);
        order.setCurrency("CNY");
        order.setPayType(req.getPayType());
        order.setPayUrl(req.getPayUrl());
        order.setStatus(0); // 待支付
        order.setExpireTime(now.plusMinutes(10)); // 10 分钟过期
        order.setCreatedAt(now);
        order.setUpdatedAt(now);

        paymentOrdersMapper.insert(order);

        PaymentOrderCreateVO vo = new PaymentOrderCreateVO();
        vo.setId(order.getId());
        vo.setOrderNo(order.getOrderNo());
        vo.setAmount(order.getAmount());
        vo.setCurrency(order.getCurrency());
        vo.setPayUrl(order.getPayUrl());
        vo.setExpireTime(order.getExpireTime());

        return vo;
    }

    /**
     * 生成订单号：PAY + 时间戳 + 用户ID后4位 + 4位随机数
     */
    private String generateOrderNo(Long userId) {
        String timestamp = LocalDateTime.now().format(ORDER_DATE_FORMAT);
        long uidPart = userId % 10000;
        int random = ThreadLocalRandom.current().nextInt(1000, 9999);
        return String.format("PAY%s%04d%d", timestamp, uidPart, random);
    }

    @Override
    @Transactional
    public PaymentSuccessVO paymentSuccess(PaymentSuccessDTO req) {
        Long userId = getCurrentUserId();

        // 校验订单是否存在
        PaymentOrders order = paymentOrdersMapper.selectById(req.getOrderId());
        if (order == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "支付订单不存在");
        }
        if (!order.getUserId().equals(userId)) {
            throw new BusinessException(ResultCode.FORBIDDEN, "无权操作该订单");
        }
        if (order.getStatus() != null && order.getStatus() != 0) {
            throw new BusinessException(ResultCode.BAD_REQUEST, "订单状态异常，无法支付");
        }

        // 校验方案
        MembershipPlans plan = membershipPlansMapper.selectById(order.getPlanId());
        if (plan == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "会员方案不存在");
        }

        LocalDateTime now = LocalDateTime.now();

        // 1. 更新支付订单为已支付
        order.setStatus(1);
        order.setTransactionId(req.getTransactionId());
        order.setPayTime(now);
        order.setUpdatedAt(now);
        paymentOrdersMapper.updateById(order);

        // 2. 若用户为免费用户，升级为会员
        User user = userMapper.selectById(userId);
        if (user != null && (user.getProduct() == null || user.getProduct() == 0)) {
            user.setProduct(1);
            user.setUpdatedAt(now);
            userMapper.updateById(user);
        }

        // 3. 处理会员订阅
        LocalDateTime membershipStart;
        LocalDateTime membershipEnd;

        // 查询当前方案是否有正在生效中的会员记录
        UserMemberships activeMembership = userMembershipsMapper.selectOne(
                new LambdaQueryWrapper<UserMemberships>()
                        .eq(UserMemberships::getUserId, userId)
                        .eq(UserMemberships::getPlanId, order.getPlanId())
                        .eq(UserMemberships::getStatus, 1)
                        .gt(UserMemberships::getEndDate, now)
        );

        if (activeMembership != null) {
            // 已有生效中的会员，在现有到期时间上叠加
            membershipStart = activeMembership.getStartDate();
            membershipEnd = activeMembership.getEndDate().plusMonths(plan.getDurationMonths());

            activeMembership.setEndDate(membershipEnd);
            activeMembership.setUpdatedAt(now);
            userMembershipsMapper.updateById(activeMembership);
        } else {
            // 无生效中的会员，新建记录
            membershipStart = now;
            membershipEnd = now.plusMonths(plan.getDurationMonths());

            UserMemberships newMembership = new UserMemberships();
            newMembership.setUserId(userId);
            newMembership.setPlanId(order.getPlanId());
            newMembership.setOrderId(order.getId());
            newMembership.setStartDate(membershipStart);
            newMembership.setEndDate(membershipEnd);
            newMembership.setStatus(1);
            newMembership.setCreatedAt(now);
            newMembership.setUpdatedAt(now);
            userMembershipsMapper.insert(newMembership);
        }

        // 4. 组装返回
        PaymentSuccessVO vo = new PaymentSuccessVO();
        vo.setOrderId(order.getId());
        vo.setOrderNo(order.getOrderNo());
        vo.setAmount(order.getAmount());
        vo.setPlanName(plan.getName());
        vo.setMembershipStartDate(membershipStart);
        vo.setMembershipEndDate(membershipEnd);

        return vo;
    }

    @Override
    public List<UserPendingOrderVO> listMyPendingOrders() {
        Long userId = getCurrentUserId();
        LocalDateTime now = LocalDateTime.now();

        // 查询当前用户待支付且未过期的订单
        List<PaymentOrders> orders = paymentOrdersMapper.selectList(
                new LambdaQueryWrapper<PaymentOrders>()
                        .eq(PaymentOrders::getUserId, userId)
                        .eq(PaymentOrders::getStatus, 0)
                        .gt(PaymentOrders::getExpireTime, now)
                        .orderByDesc(PaymentOrders::getCreatedAt)
        );

        if (orders.isEmpty()) {
            return Collections.emptyList();
        }

        // 批量查询方案名称
        Set<Long> planIds = orders.stream().map(PaymentOrders::getPlanId).collect(Collectors.toSet());
        Map<Long, MembershipPlans> planMap = membershipPlansMapper.selectBatchIds(planIds).stream()
                .collect(Collectors.toMap(MembershipPlans::getId, p -> p));

        return orders.stream().map(order -> {
            UserPendingOrderVO vo = new UserPendingOrderVO();
            vo.setId(order.getId());
            vo.setOrderNo(order.getOrderNo());
            vo.setPlanId(order.getPlanId());
            vo.setAmount(order.getAmount());
            vo.setCurrency(order.getCurrency());
            vo.setPayType(order.getPayType());
            vo.setStatus(order.getStatus());
            vo.setPayUrl(order.getPayUrl());
            vo.setExpireTime(order.getExpireTime());
            vo.setCreatedAt(order.getCreatedAt());

            MembershipPlans plan = planMap.get(order.getPlanId());
            if (plan != null) {
                vo.setPlanName(plan.getName());
            }

            return vo;
        }).collect(Collectors.toList());
    }

    private Long getCurrentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof UserPrincipal principal) {
            return principal.getUserId();
        }
        throw new BusinessException(ResultCode.UNAUTHORIZED);
    }
}
