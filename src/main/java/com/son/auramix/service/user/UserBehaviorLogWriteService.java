package com.son.auramix.service.user;

import com.son.auramix.domain.dto.user.UserBehaviorLogCreateDTO;

/**
 * 用户行为日志异步写入服务 — 写入频繁，不能阻塞主线程
 */
public interface UserBehaviorLogWriteService {

    /** 异步写入行为日志，失败时自动重试 3 次 */
    void createAsync(UserBehaviorLogCreateDTO req, Long userId);
}
