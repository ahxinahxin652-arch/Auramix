package com.son.auramix.service.user.impl;

import com.son.auramix.domain.dto.user.UserBehaviorLogCreateDTO;
import com.son.auramix.domain.entity.UserBehaviorLog;
import com.son.auramix.mapper.UserBehaviorLogMapper;
import com.son.auramix.service.user.UserBehaviorLogWriteService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

/**
 * 用户行为日志异步写入实现 — @Async 投递到专用线程池，主线程立即返回
 */
@Slf4j
@Service
public class UserBehaviorLogWriteServiceImpl implements UserBehaviorLogWriteService {

    private final UserBehaviorLogMapper userBehaviorLogMapper;

    private static final int MAX_RETRIES = 3;
    private static final long INITIAL_BACKOFF_MS = 200;

    public UserBehaviorLogWriteServiceImpl(UserBehaviorLogMapper userBehaviorLogMapper) {
        this.userBehaviorLogMapper = userBehaviorLogMapper;
    }

    @Override
    @Async("logWriteExecutor")
    public void createAsync(UserBehaviorLogCreateDTO req, Long userId) {
        String taskKey = String.format("[UserBehaviorLog] userId=%d actionType=%s targetId=%d",
                userId, req.getActionType(), req.getTargetId());
        executeWithRetry(taskKey, () -> {
            UserBehaviorLog logEntity = new UserBehaviorLog();
            logEntity.setUserId(userId);
            logEntity.setActionType(req.getActionType());
            logEntity.setTargetType(req.getTargetType());
            logEntity.setTargetId(req.getTargetId());
            logEntity.setMetadata(req.getMetadata());
            userBehaviorLogMapper.insert(logEntity);
            log.info("{} id={} targetType={}", taskKey, logEntity.getId(), req.getTargetType());
        });
    }

    // ============================ 通用重试 ============================

    private void executeWithRetry(String taskKey, Runnable action) {
        for (int attempt = 1; attempt <= MAX_RETRIES; attempt++) {
            try {
                action.run();
                return;
            } catch (Exception e) {
                log.warn("{} 第 {} 次写入失败: {}", taskKey, attempt, e.getMessage());
                if (attempt < MAX_RETRIES) {
                    try {
                        Thread.sleep(INITIAL_BACKOFF_MS * (1L << (attempt - 1)));
                    } catch (InterruptedException ie) {
                        Thread.currentThread().interrupt();
                        break;
                    }
                } else {
                    log.error("{} 重试 {} 次全部失败，已丢弃", taskKey, MAX_RETRIES, e);
                }
            }
        }
    }
}
