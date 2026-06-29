package com.son.auramix.service.user.impl;

import com.son.auramix.common.exception.BusinessException;
import com.son.auramix.domain.dto.user.UserBehaviorLogCreateDTO;
import com.son.auramix.domain.dto.user.UserBehaviorLogUpdateDTO;
import com.son.auramix.domain.entity.UserBehaviorLog;
import com.son.auramix.domain.vo.user.UserBehaviorLogVO;
import com.son.auramix.mapper.UserBehaviorLogMapper;
import com.son.auramix.security.user.UserPrincipal;
import com.son.auramix.service.user.UserBehaviorLogService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * 用户行为日志服务实现
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class UserBehaviorLogServiceImpl implements UserBehaviorLogService {

    private final UserBehaviorLogMapper userBehaviorLogMapper;

    /**
     * 从 SecurityContextHolder 获取当前登录用户 ID
     */
    private Long getCurrentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof UserPrincipal principal) {
            return principal.getUserId();
        }
        throw new RuntimeException("用户未登录");
    }

    @Override
    @Transactional
    public UserBehaviorLogVO create(UserBehaviorLogCreateDTO req) {
        Long userId = getCurrentUserId();

        UserBehaviorLog log = new UserBehaviorLog();
        log.setUserId(userId);
        log.setActionType(req.getActionType());
        log.setTargetType(req.getTargetType());
        log.setTargetId(req.getTargetId());
        log.setMetadata(req.getMetadata());

        userBehaviorLogMapper.insert(log);


        return toVO(log);
    }

    @Override
    @Transactional
    public UserBehaviorLogVO update(Long logId, UserBehaviorLogUpdateDTO req) {
        Long userId = getCurrentUserId();

        UserBehaviorLog existing = userBehaviorLogMapper.selectById(logId);
        if (existing == null) {
            throw new BusinessException("行为日志不存在");
        }
        if (!existing.getUserId().equals(userId)) {
            throw new BusinessException("无权修改他人的行为日志");
        }

        if (req.getActionType() != null) {
            existing.setActionType(req.getActionType());
        }
        if (req.getTargetType() != null) {
            existing.setTargetType(req.getTargetType());
        }
        if (req.getTargetId() != null) {
            existing.setTargetId(req.getTargetId());
        }
        if (req.getMetadata() != null) {
            existing.setMetadata(req.getMetadata());
        }

        userBehaviorLogMapper.updateById(existing);

        log.info("[UserBehaviorLog] 修改行为日志 logId={}, userId={}", logId, userId);

        return toVO(existing);
    }

    // ============================ 实体转 VO ============================

    private UserBehaviorLogVO toVO(UserBehaviorLog entity) {
        UserBehaviorLogVO vo = new UserBehaviorLogVO();
        vo.setId(entity.getId());
        vo.setUserId(entity.getUserId());
        vo.setActionType(entity.getActionType());
        vo.setTargetType(entity.getTargetType());
        vo.setTargetId(entity.getTargetId());
        vo.setMetadata(entity.getMetadata());
        vo.setCreatedAt(entity.getCreatedAt());
        vo.setUpdatedAt(entity.getUpdatedAt());
        return vo;
    }
}
