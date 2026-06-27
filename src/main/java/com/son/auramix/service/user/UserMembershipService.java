package com.son.auramix.service.user;

import com.son.auramix.domain.vo.user.CurrentUserMembershipVO;
import com.son.auramix.domain.vo.user.UserMembershipVO;

import java.util.List;

public interface UserMembershipService {

    /**
     * 获取所有用户的会员信息（仅返回有效会员，合并同一用户同一方案的多次购买时间）
     */
    List<UserMembershipVO> listAllUserMemberships();

    /**
     * 获取当前用户的会员订阅信息（含方案信息 + 权益列表 + 订阅有效期）
     */
    List<CurrentUserMembershipVO> getCurrentUserMemberships();

    /**
     * 将指定会员订阅标记为已过期，若用户无其他有效会员则降级为免费用户
     */
    void expireMembership(Long id);
}
