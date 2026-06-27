package com.son.auramix.service.admin.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.son.auramix.common.exception.BusinessException;
import com.son.auramix.common.result.ResultCode;
import com.son.auramix.domain.dto.admin.MemberBenefitCreateDTO;
import com.son.auramix.domain.dto.admin.MemberBenefitUpdateDTO;
import com.son.auramix.domain.dto.admin.MembershipPlanCreateDTO;
import com.son.auramix.domain.dto.admin.MembershipPlanUpdateDTO;
import com.son.auramix.domain.entity.MemberBenefits;
import com.son.auramix.domain.entity.MembershipPlans;
import com.son.auramix.domain.vo.admin.MemberBenefitVO;
import com.son.auramix.domain.vo.admin.MembershipPlanVO;
import com.son.auramix.domain.vo.admin.PlanBenefitsVO;
import com.son.auramix.mapper.MemberBenefitsMapper;
import com.son.auramix.mapper.MembershipPlansMapper;
import com.son.auramix.service.admin.MemberPlanService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MemberPlanServiceImpl implements MemberPlanService {

    private final MembershipPlansMapper membershipPlansMapper;
    private final MemberBenefitsMapper memberBenefitsMapper;

    @Override
    public List<MembershipPlanVO> listPlans() {
        LambdaQueryWrapper<MembershipPlans> wrapper = new LambdaQueryWrapper<>();
        wrapper.orderByAsc(MembershipPlans::getSortOrder)
                .orderByAsc(MembershipPlans::getLevel);

        List<MembershipPlans> plans = membershipPlansMapper.selectList(wrapper);

        // 收集所有方案 ID，批量查询权益
        Set<Long> planIds = plans.stream().map(MembershipPlans::getId).collect(Collectors.toSet());
        Map<Long, List<MemberBenefitVO>> benefitsMap = Collections.emptyMap();
        if (!planIds.isEmpty()) {
            List<MemberBenefits> allBenefits = memberBenefitsMapper.selectList(
                    new LambdaQueryWrapper<MemberBenefits>()
                            .in(MemberBenefits::getPlanId, planIds)
                            .orderByAsc(MemberBenefits::getSortOrder)
            );
            benefitsMap = allBenefits.stream().map(b -> {
                MemberBenefitVO vo = new MemberBenefitVO();
                vo.setId(b.getId());
                vo.setPlanId(b.getPlanId());
                vo.setBenefitKey(b.getBenefitKey());
                vo.setBenefitValue(b.getBenefitValue());
                vo.setBenefitType(b.getBenefitType());
                vo.setStatus(b.getStatus());
                vo.setSortOrder(b.getSortOrder());
                vo.setCreatedAt(b.getCreatedAt());
                vo.setUpdatedAt(b.getUpdatedAt());
                return vo;
            }).collect(Collectors.groupingBy(MemberBenefitVO::getPlanId));
        }

        Map<Long, List<MemberBenefitVO>> finalBenefitsMap = benefitsMap;
        return plans.stream().map(p -> {
            MembershipPlanVO vo = new MembershipPlanVO();
            vo.setId(p.getId());
            vo.setName(p.getName());
            vo.setDescription(p.getDescription());
            vo.setDurationMonths(p.getDurationMonths());
            vo.setPrice(p.getPrice());
            vo.setOriginalPrice(p.getOriginalPrice());
            vo.setLevel(p.getLevel());
            vo.setStatus(p.getStatus());
            vo.setSortOrder(p.getSortOrder());
            vo.setCreatedAt(p.getCreatedAt());
            vo.setUpdatedAt(p.getUpdatedAt());
            vo.setBenefits(finalBenefitsMap.getOrDefault(p.getId(), Collections.emptyList()));
            return vo;
        }).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void createPlan(MembershipPlanCreateDTO req) {
        // 校验方案名称唯一性
        Long count = membershipPlansMapper.selectCount(new LambdaQueryWrapper<MembershipPlans>()
                .eq(MembershipPlans::getName, req.getName())
        );
        if (count > 0) {
            throw new BusinessException(ResultCode.BAD_REQUEST, "会员方案名称已存在");
        }

        MembershipPlans plan = new MembershipPlans();
        plan.setName(req.getName());
        plan.setDescription(req.getDescription());
        plan.setDurationMonths(req.getDurationMonths());
        plan.setPrice(req.getPrice());
        plan.setOriginalPrice(req.getOriginalPrice());
        plan.setLevel(req.getLevel() != null ? req.getLevel() : 1);
        plan.setStatus(req.getStatus() != null ? req.getStatus() : 1);
        plan.setSortOrder(req.getSortOrder() != null ? req.getSortOrder() : 0);

        membershipPlansMapper.insert(plan);
    }

    @Override
    @Transactional
    public void updatePlan(Long id, MembershipPlanUpdateDTO req) {
        // 校验方案是否存在
        MembershipPlans plan = membershipPlansMapper.selectById(id);
        if (plan == null) {
            throw new BusinessException(ResultCode.NOT_FOUND);
        }

        // 校验方案名称唯一性（如果修改了名称）
        if (req.getName() != null && !req.getName().equals(plan.getName())) {
            Long count = membershipPlansMapper.selectCount(new LambdaQueryWrapper<MembershipPlans>()
                    .eq(MembershipPlans::getName, req.getName())
                    .ne(MembershipPlans::getId, id)
            );
            if (count > 0) {
                throw new BusinessException(ResultCode.BAD_REQUEST, "会员方案名称已存在");
            }
        }

        // 只更新传入的非 null 字段
        if (req.getName() != null) plan.setName(req.getName());
        if (req.getDescription() != null) plan.setDescription(req.getDescription());
        if (req.getDurationMonths() != null) plan.setDurationMonths(req.getDurationMonths());
        if (req.getPrice() != null) plan.setPrice(req.getPrice());
        if (req.getOriginalPrice() != null) plan.setOriginalPrice(req.getOriginalPrice());
        if (req.getLevel() != null) plan.setLevel(req.getLevel());
        if (req.getStatus() != null) plan.setStatus(req.getStatus());
        if (req.getSortOrder() != null) plan.setSortOrder(req.getSortOrder());

        membershipPlansMapper.updateById(plan);
    }

    @Override
    public PlanBenefitsVO listBenefitsByPlanId(Long planId) {
        // 校验方案是否存在
        MembershipPlans plan = membershipPlansMapper.selectById(planId);
        if (plan == null) {
            throw new BusinessException(ResultCode.NOT_FOUND);
        }

        LambdaQueryWrapper<MemberBenefits> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(MemberBenefits::getPlanId, planId)
                .orderByAsc(MemberBenefits::getSortOrder);

        List<MemberBenefits> benefits = memberBenefitsMapper.selectList(wrapper);
        List<MemberBenefitVO> benefitList = benefits.stream().map(b -> {
            MemberBenefitVO vo = new MemberBenefitVO();
            vo.setId(b.getId());
            vo.setPlanId(b.getPlanId());
            vo.setBenefitKey(b.getBenefitKey());
            vo.setBenefitValue(b.getBenefitValue());
            vo.setBenefitType(b.getBenefitType());
            vo.setStatus(b.getStatus());
            vo.setSortOrder(b.getSortOrder());
            vo.setCreatedAt(b.getCreatedAt());
            vo.setUpdatedAt(b.getUpdatedAt());
            return vo;
        }).collect(Collectors.toList());

        PlanBenefitsVO result = new PlanBenefitsVO();
        result.setPlanId(planId);
        result.setBenefits(benefitList);
        return result;
    }

    @Override
    @Transactional
    public void createBenefit(MemberBenefitCreateDTO req) {
        // 校验方案是否存在
        MembershipPlans plan = membershipPlansMapper.selectById(req.getPlanId());
        if (plan == null) {
            throw new BusinessException(ResultCode.BAD_REQUEST, "所属会员方案不存在");
        }

        // 校验同一方案下 benefitKey 唯一性
        Long count = memberBenefitsMapper.selectCount(new LambdaQueryWrapper<MemberBenefits>()
                .eq(MemberBenefits::getPlanId, req.getPlanId())
                .eq(MemberBenefits::getBenefitKey, req.getBenefitKey())
        );
        if (count > 0) {
            throw new BusinessException(ResultCode.BAD_REQUEST, "该方案下权益标识已存在");
        }

        MemberBenefits benefit = new MemberBenefits();
        benefit.setPlanId(req.getPlanId());
        benefit.setBenefitKey(req.getBenefitKey());
        benefit.setBenefitValue(req.getBenefitValue());
        benefit.setBenefitType(req.getBenefitType() != null ? req.getBenefitType() : 1);
        benefit.setStatus(req.getStatus() != null ? req.getStatus() : 1);
        benefit.setSortOrder(req.getSortOrder() != null ? req.getSortOrder() : 0);

        memberBenefitsMapper.insert(benefit);
    }

    @Override
    @Transactional
    public void updateBenefit(Long id, MemberBenefitUpdateDTO req) {
        // 校验权益是否存在
        MemberBenefits benefit = memberBenefitsMapper.selectById(id);
        if (benefit == null) {
            throw new BusinessException(ResultCode.NOT_FOUND);
        }

        // 校验同一方案下 benefitKey 唯一性（如果修改了 benefitKey）
        if (req.getBenefitKey() != null && !req.getBenefitKey().equals(benefit.getBenefitKey())) {
            Long count = memberBenefitsMapper.selectCount(new LambdaQueryWrapper<MemberBenefits>()
                    .eq(MemberBenefits::getPlanId, benefit.getPlanId())
                    .eq(MemberBenefits::getBenefitKey, req.getBenefitKey())
                    .ne(MemberBenefits::getId, id)
            );
            if (count > 0) {
                throw new BusinessException(ResultCode.BAD_REQUEST, "该方案下权益标识已存在");
            }
        }

        // 只更新传入的非 null 字段
        if (req.getBenefitKey() != null) benefit.setBenefitKey(req.getBenefitKey());
        if (req.getBenefitValue() != null) benefit.setBenefitValue(req.getBenefitValue());
        if (req.getBenefitType() != null) benefit.setBenefitType(req.getBenefitType());
        if (req.getStatus() != null) benefit.setStatus(req.getStatus());
        if (req.getSortOrder() != null) benefit.setSortOrder(req.getSortOrder());

        memberBenefitsMapper.updateById(benefit);
    }
}
