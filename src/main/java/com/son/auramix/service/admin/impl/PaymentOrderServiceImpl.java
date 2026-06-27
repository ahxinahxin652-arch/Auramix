package com.son.auramix.service.admin.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.son.auramix.common.exception.BusinessException;
import com.son.auramix.common.result.ResultCode;
import com.son.auramix.domain.dto.admin.PaymentOrderSearchDTO;
import com.son.auramix.domain.dto.admin.PaymentOrderUpdateDTO;
import com.son.auramix.domain.dto.common.PageDTO;
import com.son.auramix.domain.entity.MembershipPlans;
import com.son.auramix.domain.entity.PaymentOrders;
import com.son.auramix.domain.entity.User;
import com.son.auramix.domain.vo.admin.PaymentOrderVO;
import com.son.auramix.domain.vo.common.PageResult;
import com.son.auramix.mapper.MembershipPlansMapper;
import com.son.auramix.mapper.PaymentOrdersMapper;
import com.son.auramix.mapper.UserMapper;
import com.son.auramix.service.admin.PaymentOrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PaymentOrderServiceImpl implements PaymentOrderService {

    private final PaymentOrdersMapper paymentOrdersMapper;
    private final UserMapper userMapper;
    private final MembershipPlansMapper membershipPlansMapper;

    @Override
    public PageResult<PaymentOrderVO> listAllPaymentOrders(PageDTO pageDTO) {
        Page<PaymentOrders> page = new Page<>(pageDTO.getPage(), pageDTO.getPageSize());
        Page<PaymentOrders> pageResult = paymentOrdersMapper.selectPage(page,
                new LambdaQueryWrapper<PaymentOrders>()
                        .orderByDesc(PaymentOrders::getCreatedAt)
        );

        List<PaymentOrders> orders = pageResult.getRecords();
        if (orders.isEmpty()) {
            return PageResult.empty();
        }

        // 批量查询用户和方案
        Set<Long> userIds = orders.stream().map(PaymentOrders::getUserId).collect(Collectors.toSet());
        Set<Long> planIds = orders.stream().map(PaymentOrders::getPlanId).collect(Collectors.toSet());

        Map<Long, User> userMap = userMapper.selectBatchIds(userIds).stream()
                .collect(Collectors.toMap(User::getId, u -> u));
        Map<Long, MembershipPlans> planMap = membershipPlansMapper.selectBatchIds(planIds).stream()
                .collect(Collectors.toMap(MembershipPlans::getId, p -> p));

        List<PaymentOrderVO> voList = orders.stream().map(order -> {
            PaymentOrderVO vo = new PaymentOrderVO();
            vo.setId(order.getId());
            vo.setOrderNo(order.getOrderNo());
            vo.setUserId(order.getUserId());
            vo.setPlanId(order.getPlanId());
            vo.setAmount(order.getAmount());
            vo.setCurrency(order.getCurrency());
            vo.setPayType(order.getPayType());
            vo.setStatus(order.getStatus());
            vo.setPayUrl(order.getPayUrl());
            vo.setPayTime(order.getPayTime());
            vo.setExpireTime(order.getExpireTime());
            vo.setTransactionId(order.getTransactionId());
            vo.setRefundTime(order.getRefundTime());
            vo.setCreatedAt(order.getCreatedAt());
            vo.setUpdatedAt(order.getUpdatedAt());

            // 填充用户信息
            User user = userMap.get(order.getUserId());
            if (user != null) {
                vo.setDisplayName(user.getDisplayName());
                vo.setEmail(user.getEmail());
                vo.setAvatarUrl(user.getAvatarUrl());
            }

            // 填充方案名称
            MembershipPlans plan = planMap.get(order.getPlanId());
            if (plan != null) {
                vo.setPlanName(plan.getName());
            }

            return vo;
        }).collect(Collectors.toList());

        return PageResult.of(pageResult.getTotal(), pageResult.getCurrent(), pageResult.getSize(), voList);
    }

    @Override
    public PageResult<PaymentOrderVO> searchPaymentOrders(PaymentOrderSearchDTO dto) {
        // 1. 根据邮箱精确匹配用户 ID
        if (StringUtils.hasText(dto.getEmail())) {
            List<User> users = userMapper.selectList(
                    new LambdaQueryWrapper<User>()
                            .eq(User::getEmail, dto.getEmail())
            );
            if (users.isEmpty()) {
                return PageResult.of(0, (long) dto.getPage(), (long) dto.getPageSize(), Collections.emptyList());
            }
            // 使用匹配到的用户 ID 查询订单
            Set<Long> userIds = users.stream().map(User::getId).collect(Collectors.toSet());
            Page<PaymentOrders> page = new Page<>(dto.getPage(), dto.getPageSize());
            LambdaQueryWrapper<PaymentOrders> wrapper = new LambdaQueryWrapper<PaymentOrders>()
                    .in(PaymentOrders::getUserId, userIds);
            if (dto.getPayType() != null) {
                wrapper.eq(PaymentOrders::getPayType, dto.getPayType());
            }
            if (dto.getStatus() != null) {
                wrapper.eq(PaymentOrders::getStatus, dto.getStatus());
            }
            wrapper.orderByDesc(PaymentOrders::getCreatedAt);
            Page<PaymentOrders> pageResult = paymentOrdersMapper.selectPage(page, wrapper);
            return buildPaymentOrderPageResult(pageResult);
        }

        // 2. 不传邮箱时，只按 payType 和 status 筛选
        Page<PaymentOrders> page = new Page<>(dto.getPage(), dto.getPageSize());
        LambdaQueryWrapper<PaymentOrders> wrapper = new LambdaQueryWrapper<>();
        if (dto.getPayType() != null) {
            wrapper.eq(PaymentOrders::getPayType, dto.getPayType());
        }
        if (dto.getStatus() != null) {
            wrapper.eq(PaymentOrders::getStatus, dto.getStatus());
        }
        wrapper.orderByDesc(PaymentOrders::getCreatedAt);
        Page<PaymentOrders> pageResult = paymentOrdersMapper.selectPage(page, wrapper);
        return buildPaymentOrderPageResult(pageResult);
    }

    /**
     * 将分页查询的 PaymentOrders 结果转换为 PaymentOrderVO 分页结果
     */
    private PageResult<PaymentOrderVO> buildPaymentOrderPageResult(Page<PaymentOrders> pageResult) {
        List<PaymentOrders> orders = pageResult.getRecords();
        if (orders.isEmpty()) {
            return PageResult.of(pageResult.getTotal(), pageResult.getCurrent(), pageResult.getSize(), Collections.emptyList());
        }

        // 批量查询用户和方案
        Set<Long> userIds = orders.stream().map(PaymentOrders::getUserId).collect(Collectors.toSet());
        Set<Long> planIds = orders.stream().map(PaymentOrders::getPlanId).collect(Collectors.toSet());

        Map<Long, User> userMap = userMapper.selectBatchIds(userIds).stream()
                .collect(Collectors.toMap(User::getId, u -> u));
        Map<Long, MembershipPlans> planMap = membershipPlansMapper.selectBatchIds(planIds).stream()
                .collect(Collectors.toMap(MembershipPlans::getId, p -> p));

        List<PaymentOrderVO> voList = orders.stream().map(order -> {
            PaymentOrderVO vo = new PaymentOrderVO();
            vo.setId(order.getId());
            vo.setOrderNo(order.getOrderNo());
            vo.setUserId(order.getUserId());
            vo.setPlanId(order.getPlanId());
            vo.setAmount(order.getAmount());
            vo.setCurrency(order.getCurrency());
            vo.setPayType(order.getPayType());
            vo.setStatus(order.getStatus());
            vo.setPayUrl(order.getPayUrl());
            vo.setPayTime(order.getPayTime());
            vo.setExpireTime(order.getExpireTime());
            vo.setTransactionId(order.getTransactionId());
            vo.setRefundTime(order.getRefundTime());
            vo.setCreatedAt(order.getCreatedAt());
            vo.setUpdatedAt(order.getUpdatedAt());

            User user = userMap.get(order.getUserId());
            if (user != null) {
                vo.setDisplayName(user.getDisplayName());
                vo.setEmail(user.getEmail());
                vo.setAvatarUrl(user.getAvatarUrl());
            }

            MembershipPlans plan = planMap.get(order.getPlanId());
            if (plan != null) {
                vo.setPlanName(plan.getName());
            }

            return vo;
        }).collect(Collectors.toList());

        return PageResult.of(pageResult.getTotal(), pageResult.getCurrent(), pageResult.getSize(), voList);
    }

    @Override
    @Transactional
    public void updatePaymentOrder(Long id, PaymentOrderUpdateDTO req) {
        PaymentOrders order = paymentOrdersMapper.selectById(id);
        if (order == null) {
            throw new BusinessException(ResultCode.BAD_REQUEST, "支付订单不存在");
        }

        if (req.getAmount() != null) {
            order.setAmount(req.getAmount());
        }
        if (req.getCurrency() != null) {
            order.setCurrency(req.getCurrency());
        }
        if (req.getPayType() != null) {
            order.setPayType(req.getPayType());
        }
        if (req.getStatus() != null) {
            order.setStatus(req.getStatus());
        }
        if (req.getPayUrl() != null) {
            order.setPayUrl(req.getPayUrl());
        }
        if (req.getPayTime() != null) {
            order.setPayTime(req.getPayTime());
        }
        if (req.getExpireTime() != null) {
            order.setExpireTime(req.getExpireTime());
        }
        if (req.getTransactionId() != null) {
            order.setTransactionId(req.getTransactionId());
        }
        if (req.getRefundTime() != null) {
            order.setRefundTime(req.getRefundTime());
        }

        order.setUpdatedAt(LocalDateTime.now());
        paymentOrdersMapper.updateById(order);
    }
}
