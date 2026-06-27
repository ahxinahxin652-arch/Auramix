package com.son.auramix.service.admin;

import com.son.auramix.domain.dto.admin.MemberBenefitCreateDTO;
import com.son.auramix.domain.dto.admin.MemberBenefitUpdateDTO;
import com.son.auramix.domain.dto.admin.MembershipPlanCreateDTO;
import com.son.auramix.domain.dto.admin.MembershipPlanUpdateDTO;
import com.son.auramix.domain.vo.admin.MembershipPlanVO;
import com.son.auramix.domain.vo.admin.PlanBenefitsVO;

import java.util.List;

public interface MemberPlanService {
    List<MembershipPlanVO> listPlans();
    void createPlan(MembershipPlanCreateDTO req);
    void updatePlan(Long id, MembershipPlanUpdateDTO req);
    PlanBenefitsVO listBenefitsByPlanId(Long planId);
    void createBenefit(MemberBenefitCreateDTO req);
    void updateBenefit(Long id, MemberBenefitUpdateDTO req);
}
