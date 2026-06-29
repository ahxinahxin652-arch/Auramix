package com.son.auramix.service.user;

import com.son.auramix.domain.dto.user.UserBehaviorLogCreateDTO;
import com.son.auramix.domain.dto.user.UserBehaviorLogUpdateDTO;
import com.son.auramix.domain.vo.user.UserBehaviorLogVO;

/**
 * 用户行为日志服务
 */
public interface UserBehaviorLogService {

    /** 新增行为日志 */
    UserBehaviorLogVO create(UserBehaviorLogCreateDTO req);

    /** 修改行为日志 */
    UserBehaviorLogVO update(Long logId, UserBehaviorLogUpdateDTO req);
}
