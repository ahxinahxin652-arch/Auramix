package com.son.auramix.service.user.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.son.auramix.common.exception.BusinessException;
import com.son.auramix.common.result.ResultCode;
import com.son.auramix.domain.dto.admin.MemberSearchDTO;
import com.son.auramix.domain.dto.common.PageDTO;
import com.son.auramix.domain.entity.MemberBenefits;
import com.son.auramix.domain.entity.MembershipPlans;
import com.son.auramix.domain.entity.User;
import com.son.auramix.domain.entity.UserMemberships;
import com.son.auramix.domain.vo.admin.MemberBenefitVO;
import com.son.auramix.domain.vo.common.PageResult;
import com.son.auramix.domain.vo.user.CurrentUserMembershipVO;
import com.son.auramix.domain.vo.user.UserMembershipVO;
import com.son.auramix.mapper.MemberBenefitsMapper;
import com.son.auramix.mapper.MembershipPlansMapper;
import com.son.auramix.mapper.UserMapper;
import com.son.auramix.mapper.UserMembershipsMapper;
import com.son.auramix.security.user.UserPrincipal;
import com.son.auramix.service.user.UserMembershipService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserMembershipServiceImpl implements UserMembershipService {

    private final UserMembershipsMapper userMembershipsMapper;
    private final MembershipPlansMapper membershipPlansMapper;
    private final UserMapper userMapper;
    private final MemberBenefitsMapper memberBenefitsMapper;

    @Override
    public PageResult<UserMembershipVO> listAllUserMemberships(PageDTO pageDTO) {
        // 分页查询有效会员记录
        Page<UserMemberships> page = new Page<>(pageDTO.getPage(), pageDTO.getPageSize());
        Page<UserMemberships> pageResult = userMembershipsMapper.selectPage(page,
                new LambdaQueryWrapper<UserMemberships>()
                        .eq(UserMemberships::getStatus, 1)
                        .orderByAsc(UserMemberships::getUserId)
                        .orderByAsc(UserMemberships::getPlanId)
                        .orderByAsc(UserMemberships::getStartDate)
        );

        List<UserMemberships> allRecords = pageResult.getRecords();

        if (allRecords.isEmpty()) {
            return PageResult.of(pageResult.getTotal(), pageResult.getCurrent(), pageResult.getSize(), Collections.emptyList());
        }

        // 收集涉及的所有 userId 和 planId，批量查询
        Set<Long> userIds = allRecords.stream().map(UserMemberships::getUserId).collect(Collectors.toSet());
        Set<Long> planIds = allRecords.stream().map(UserMemberships::getPlanId).collect(Collectors.toSet());

        Map<Long, User> userMap = userMapper.selectBatchIds(userIds).stream()
                .collect(Collectors.toMap(User::getId, u -> u));
        Map<Long, MembershipPlans> planMap = membershipPlansMapper.selectBatchIds(planIds).stream()
                .collect(Collectors.toMap(MembershipPlans::getId, p -> p));

        // 按 userId -> planId 分组
        Map<Long, Map<Long, List<UserMemberships>>> grouped = allRecords.stream()
                .collect(Collectors.groupingBy(
                        UserMemberships::getUserId,
                        LinkedHashMap::new,
                        Collectors.groupingBy(UserMemberships::getPlanId, LinkedHashMap::new, Collectors.toList())
                ));

        LocalDateTime now = LocalDateTime.now();
        List<UserMembershipVO> result = new ArrayList<>();

        for (Map.Entry<Long, Map<Long, List<UserMemberships>>> userEntry : grouped.entrySet()) {
            Long userId = userEntry.getKey();
            User user = userMap.get(userId);
            if (user == null) {
                continue;
            }

            for (Map.Entry<Long, List<UserMemberships>> planEntry : userEntry.getValue().entrySet()) {
                Long planId = planEntry.getKey();
                List<UserMemberships> records = planEntry.getValue();

                MembershipPlans plan = planMap.get(planId);
                if (plan == null) {
                    continue;
                }

                // 合并同一方案下多次购买的时间
                MergedPeriod merged = mergePeriods(records, now);
                if (merged == null) {
                    continue;
                }

                UserMembershipVO vo = new UserMembershipVO();
                vo.setUserId(userId);
                vo.setDisplayName(user.getDisplayName());
                vo.setEmail(user.getEmail());
                vo.setAvatarUrl(user.getAvatarUrl());
                vo.setPlanId(planId);
                vo.setPlanName(plan.getName());
                vo.setPlanDescription(plan.getDescription());
                vo.setPlanLevel(plan.getLevel());
                vo.setOriginalPrice(plan.getOriginalPrice());
                vo.setPrice(plan.getPrice());
                vo.setDurationMonths(plan.getDurationMonths());
                vo.setStartDate(merged.startDate);
                vo.setEndDate(merged.endDate);
                vo.setPurchaseCount(merged.purchaseCount);

                result.add(vo);
            }
        }

        return PageResult.of(pageResult.getTotal(), pageResult.getCurrent(), pageResult.getSize(), result);
    }

    @Override
    public PageResult<UserMembershipVO> searchMembers(MemberSearchDTO dto) {
        LocalDateTime now = LocalDateTime.now();

        // 1. 根据邮箱精确匹配用户 ID
        Set<Long> matchedUserIds = null;
        if (StringUtils.hasText(dto.getEmail())) {
            List<User> users = userMapper.selectList(
                    new LambdaQueryWrapper<User>()
                            .eq(User::getEmail, dto.getEmail())
            );
            matchedUserIds = users.stream().map(User::getId).collect(Collectors.toSet());
            if (matchedUserIds.isEmpty()) {
                return PageResult.of(0, (long) dto.getPage(), (long) dto.getPageSize(), Collections.emptyList());
            }
        }

        // 2. 根据会员等级匹配方案 ID
        Set<Long> matchedPlanIds = null;
        if (dto.getPlanLevel() != null) {
            List<MembershipPlans> plans = membershipPlansMapper.selectList(
                    new LambdaQueryWrapper<MembershipPlans>()
                            .eq(MembershipPlans::getLevel, dto.getPlanLevel())
                            .eq(MembershipPlans::getStatus, 1)
            );
            matchedPlanIds = plans.stream().map(MembershipPlans::getId).collect(Collectors.toSet());
            if (matchedPlanIds.isEmpty()) {
                return PageResult.of(0, (long) dto.getPage(), (long) dto.getPageSize(), Collections.emptyList());
            }
        }

        // 3. 构建 user_memberships 查询条件
        LambdaQueryWrapper<UserMemberships> wrapper = new LambdaQueryWrapper<UserMemberships>()
                .eq(UserMemberships::getStatus, 1)
                .orderByAsc(UserMemberships::getUserId)
                .orderByAsc(UserMemberships::getPlanId)
                .orderByAsc(UserMemberships::getStartDate);

        if (matchedUserIds != null) {
            wrapper.in(UserMemberships::getUserId, matchedUserIds);
        }
        if (matchedPlanIds != null) {
            wrapper.in(UserMemberships::getPlanId, matchedPlanIds);
        }

        // 4. 分页查询
        Page<UserMemberships> page = new Page<>(dto.getPage(), dto.getPageSize());
        Page<UserMemberships> pageResult = userMembershipsMapper.selectPage(page, wrapper);

        List<UserMemberships> allRecords = pageResult.getRecords();
        if (allRecords.isEmpty()) {
            return PageResult.of(pageResult.getTotal(), pageResult.getCurrent(), pageResult.getSize(), Collections.emptyList());
        }

        // 5. 批量查询用户和方案
        Set<Long> userIds = allRecords.stream().map(UserMemberships::getUserId).collect(Collectors.toSet());
        Set<Long> planIds = allRecords.stream().map(UserMemberships::getPlanId).collect(Collectors.toSet());

        Map<Long, User> userMap = userMapper.selectBatchIds(userIds).stream()
                .collect(Collectors.toMap(User::getId, u -> u));
        Map<Long, MembershipPlans> planMap = membershipPlansMapper.selectBatchIds(planIds).stream()
                .collect(Collectors.toMap(MembershipPlans::getId, p -> p));

        // 6. 分组 & 合并
        Map<Long, Map<Long, List<UserMemberships>>> grouped = allRecords.stream()
                .collect(Collectors.groupingBy(
                        UserMemberships::getUserId,
                        LinkedHashMap::new,
                        Collectors.groupingBy(UserMemberships::getPlanId, LinkedHashMap::new, Collectors.toList())
                ));

        List<UserMembershipVO> result = new ArrayList<>();
        for (Map.Entry<Long, Map<Long, List<UserMemberships>>> userEntry : grouped.entrySet()) {
            Long userId = userEntry.getKey();
            User user = userMap.get(userId);
            if (user == null) {
                continue;
            }

            for (Map.Entry<Long, List<UserMemberships>> planEntry : userEntry.getValue().entrySet()) {
                Long planId = planEntry.getKey();
                List<UserMemberships> records = planEntry.getValue();

                MembershipPlans plan = planMap.get(planId);
                if (plan == null) {
                    continue;
                }

                MergedPeriod merged = mergePeriods(records, now);
                if (merged == null) {
                    continue;
                }

                UserMembershipVO vo = new UserMembershipVO();
                vo.setUserId(userId);
                vo.setDisplayName(user.getDisplayName());
                vo.setEmail(user.getEmail());
                vo.setAvatarUrl(user.getAvatarUrl());
                vo.setPlanId(planId);
                vo.setPlanName(plan.getName());
                vo.setPlanDescription(plan.getDescription());
                vo.setPlanLevel(plan.getLevel());
                vo.setOriginalPrice(plan.getOriginalPrice());
                vo.setPrice(plan.getPrice());
                vo.setDurationMonths(plan.getDurationMonths());
                vo.setStartDate(merged.startDate);
                vo.setEndDate(merged.endDate);
                vo.setPurchaseCount(merged.purchaseCount);

                result.add(vo);
            }
        }

        return PageResult.of(pageResult.getTotal(), pageResult.getCurrent(), pageResult.getSize(), result);
    }

    @Override
    @Transactional
    public List<CurrentUserMembershipVO> getCurrentUserMemberships() {
        Long userId = getCurrentUserId();
        LocalDateTime now = LocalDateTime.now();

        // 1. 查询当前用户所有生效中的会员记录（status=1），不做过期过滤
        List<UserMemberships> allActive = userMembershipsMapper.selectList(
                new LambdaQueryWrapper<UserMemberships>()
                        .eq(UserMemberships::getUserId, userId)
                        .eq(UserMemberships::getStatus, 1)
                        .orderByAsc(UserMemberships::getPlanId)
                        .orderByAsc(UserMemberships::getStartDate)
        );

        if (allActive.isEmpty()) {
            return Collections.emptyList();
        }

        // 2. 分离已到期和未到期的记录
        List<UserMemberships> expired = allActive.stream()
                .filter(r -> !r.getEndDate().isAfter(now))
                .collect(Collectors.toList());

        List<UserMemberships> valid = allActive.stream()
                .filter(r -> r.getEndDate().isAfter(now))
                .collect(Collectors.toList());

        // 3. 将已到期的记录状态设为 0（已过期）
        if (!expired.isEmpty()) {
            for (UserMemberships e : expired) {
                e.setStatus(0);
                e.setUpdatedAt(now);
                userMembershipsMapper.updateById(e);
            }

            // 4. 若该用户无任何生效中的会员订阅，则将用户降级为免费用户
            long stillActiveCount = userMembershipsMapper.selectCount(
                    new LambdaQueryWrapper<UserMemberships>()
                            .eq(UserMemberships::getUserId, userId)
                            .eq(UserMemberships::getStatus, 1)
                            .gt(UserMemberships::getEndDate, now)
            );

            if (stillActiveCount == 0) {
                User user = userMapper.selectById(userId);
                if (user != null && user.getProduct() != null && user.getProduct() != 0) {
                    user.setProduct(0);
                    user.setUpdatedAt(now);
                    userMapper.updateById(user);
                }
            }
        }

        // 5. 无有效记录则返回空
        if (valid.isEmpty()) {
            return Collections.emptyList();
        }

        // 按 planId 分组
        Map<Long, List<UserMemberships>> grouped = valid.stream()
                .collect(Collectors.groupingBy(UserMemberships::getPlanId, LinkedHashMap::new, Collectors.toList()));

        // 批量查询方案和权益
        Set<Long> planIds = grouped.keySet();
        Map<Long, MembershipPlans> planMap = membershipPlansMapper.selectBatchIds(planIds).stream()
                .collect(Collectors.toMap(MembershipPlans::getId, p -> p));

        List<MemberBenefits> allBenefits = memberBenefitsMapper.selectList(
                new LambdaQueryWrapper<MemberBenefits>()
                        .in(MemberBenefits::getPlanId, planIds)
                        .eq(MemberBenefits::getStatus, 1)
                        .orderByAsc(MemberBenefits::getSortOrder)
        );
        Map<Long, List<MemberBenefits>> benefitsMap = allBenefits.stream()
                .collect(Collectors.groupingBy(MemberBenefits::getPlanId));

        List<CurrentUserMembershipVO> result = new ArrayList<>();

        for (Map.Entry<Long, List<UserMemberships>> entry : grouped.entrySet()) {
            Long planId = entry.getKey();
            List<UserMemberships> records = entry.getValue();

            MembershipPlans plan = planMap.get(planId);
            if (plan == null) {
                continue;
            }

            // 合并同一方案的多次购买时间
            MergedPeriod merged = mergePeriods(records, now);
            if (merged == null) {
                continue;
            }

            CurrentUserMembershipVO vo = new CurrentUserMembershipVO();
            vo.setMembershipId(records.get(0).getId());
            vo.setPlanId(planId);
            vo.setPlanName(plan.getName());
            vo.setPlanDescription(plan.getDescription());
            vo.setPlanLevel(plan.getLevel());
            vo.setOriginalPrice(plan.getOriginalPrice());
            vo.setPrice(plan.getPrice());
            vo.setDurationMonths(plan.getDurationMonths());
            vo.setStartDate(merged.startDate);
            vo.setEndDate(merged.endDate);

            // 填充权益列表
            List<MemberBenefits> benefits = benefitsMap.getOrDefault(planId, Collections.emptyList());
            List<MemberBenefitVO> benefitVOs = benefits.stream().map(b -> {
                MemberBenefitVO bvo = new MemberBenefitVO();
                bvo.setId(b.getId());
                bvo.setPlanId(b.getPlanId());
                bvo.setBenefitKey(b.getBenefitKey());
                bvo.setBenefitValue(b.getBenefitValue());
                bvo.setBenefitType(b.getBenefitType());
                bvo.setStatus(b.getStatus());
                bvo.setSortOrder(b.getSortOrder());
                bvo.setCreatedAt(b.getCreatedAt());
                bvo.setUpdatedAt(b.getUpdatedAt());
                return bvo;
            }).collect(Collectors.toList());
            vo.setBenefits(benefitVOs);

            result.add(vo);
        }

        return result;
    }

    /**
     * 合并同一方案的多条会员记录：按 startDate 排序后，若后续记录与当前区间重叠，
     * 则将后续记录的时长叠加到当前区间尾部。
     * 返回合并后的有效区间，若最终 endDate 已过期则返回 null。
     */
    private MergedPeriod mergePeriods(List<UserMemberships> records, LocalDateTime now) {
        if (records.isEmpty()) {
            return null;
        }

        records.sort(Comparator.comparing(UserMemberships::getStartDate));

        LocalDateTime mergedStart = records.get(0).getStartDate();
        LocalDateTime mergedEnd = records.get(0).getEndDate();
        int count = 1;

        for (int i = 1; i < records.size(); i++) {
            UserMemberships curr = records.get(i);

            if (!curr.getStartDate().isAfter(mergedEnd)) {
                java.time.Duration duration = java.time.Duration.between(curr.getStartDate(), curr.getEndDate());
                if (!duration.isNegative()) {
                    mergedEnd = mergedEnd.plus(duration);
                }
            } else {
                mergedStart = curr.getStartDate();
                mergedEnd = curr.getEndDate();
            }
            count++;
        }

        if (mergedEnd.isBefore(now) || mergedEnd.isEqual(now)) {
            return null;
        }

        return new MergedPeriod(mergedStart, mergedEnd, count);
    }

    private static class MergedPeriod {
        final LocalDateTime startDate;
        final LocalDateTime endDate;
        final int purchaseCount;

        MergedPeriod(LocalDateTime startDate, LocalDateTime endDate, int purchaseCount) {
            this.startDate = startDate;
            this.endDate = endDate;
            this.purchaseCount = purchaseCount;
        }
    }

    @Override
    @Transactional
    public void expireMembership(Long id) {
        // 校验会员记录存在且为生效中
        UserMemberships membership = userMembershipsMapper.selectById(id);
        if (membership == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "会员订阅记录不存在");
        }
        if (membership.getStatus() == null || membership.getStatus() != 1) {
            throw new BusinessException(ResultCode.BAD_REQUEST, "该会员记录非生效中状态");
        }

        LocalDateTime now = LocalDateTime.now();

        // 1. 标记为已过期
        membership.setStatus(0);
        membership.setUpdatedAt(now);
        userMembershipsMapper.updateById(membership);

        // 2. 检查该用户是否还有其他生效中的会员，若无则降级为免费用户
        Long count = userMembershipsMapper.selectCount(
                new LambdaQueryWrapper<UserMemberships>()
                        .eq(UserMemberships::getUserId, membership.getUserId())
                        .eq(UserMemberships::getStatus, 1)
                        .gt(UserMemberships::getEndDate, now)
        );

        if (count == 0) {
            User user = userMapper.selectById(membership.getUserId());
            if (user != null && user.getProduct() != null && user.getProduct() != 0) {
                user.setProduct(0);
                user.setUpdatedAt(now);
                userMapper.updateById(user);
            }
        }
    }

    private Long getCurrentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof UserPrincipal principal) {
            return principal.getUserId();
        }
        throw new BusinessException(ResultCode.UNAUTHORIZED);
    }
}
