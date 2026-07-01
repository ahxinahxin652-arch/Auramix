package com.son.auramix.aspect;

import com.baomidou.mybatisplus.core.conditions.update.LambdaUpdateWrapper;
import com.son.auramix.annotation.AfterLog;
import com.son.auramix.common.exception.BusinessException;
import com.son.auramix.common.result.ResultCode;
import com.son.auramix.domain.entity.PlaybackHistory;
import com.son.auramix.domain.entity.Track;
import com.son.auramix.mapper.PlaybackHistoryMapper;
import com.son.auramix.mapper.TrackMapper;
import com.son.auramix.security.user.UserPrincipal;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.AfterReturning;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Pointcut;
import org.aspectj.lang.reflect.MethodSignature;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import java.lang.reflect.Method;
import java.lang.reflect.Parameter;

@Slf4j
@Aspect
@Component
public class PlaybackLogAspect {

    private final PlaybackHistoryMapper playbackHistoryMapper;
    private final TrackMapper trackMapper;

    public PlaybackLogAspect(PlaybackHistoryMapper playbackHistoryMapper,
                             TrackMapper trackMapper) {
        this.playbackHistoryMapper = playbackHistoryMapper;
        this.trackMapper = trackMapper;
    }

    @Pointcut("@annotation(com.son.auramix.annotation.AfterLog)")
    public void afterLogPointcut() {}

    /**
     * 仅监听 behaviorType = 0（播放歌曲）的 @AfterLog 方法
     * 成功返回后自动记录播放历史到 playback_history 表
     */
    @AfterReturning(pointcut = "afterLogPointcut() && @annotation(afterLog)", returning = "result")
    public void afterReturning(JoinPoint joinPoint, AfterLog afterLog, Object result) {
        try {
            // 0. 仅处理播放行为（behaviorType = 0），其他行为跳过
            if (afterLog.behaviorType() != 0) {
                return;
            }

            // 1. 获取当前登录用户 ID
            Long userId = getCurrentUserId();

            // 2. 从方法参数中提取 trackId
            Long trackId = extractTrackId(joinPoint);
            if (trackId == null) {
                log.warn("[播放历史] 无法从方法参数中提取 trackId，跳过记录");
                return;
            }

            // 3. 构建播放历史实体
            PlaybackHistory history = new PlaybackHistory();
            history.setUserId(userId);
            history.setTrackId(trackId);
            history.setPlayedAt(java.time.LocalDateTime.now());

            // 4. 设置播放上下文（优先从方法参数获取动态值，其次取注解静态值）
            Integer contextType = extractIntParam(joinPoint, "contextType");
            if (contextType != null && contextType >= 0) {
                history.setContextType(contextType);
            } else if (afterLog.contextType() >= 0) {
                history.setContextType(afterLog.contextType());
            }

            Long contextId = extractLongParam(joinPoint, "contextId");
            if (contextId != null && contextId > 0) {
                history.setContextId(contextId);
            } else if (afterLog.contextId() > 0) {
                history.setContextId(afterLog.contextId());
            }

            // 5. 写入数据库
            playbackHistoryMapper.insert(history);

            // 6. 递增 tracks 表中的 play_count
            incrementPlayCount(trackId);

            log.debug("[播放历史] 已记录 userId={}, trackId={}, contextType={}, contextId={}",
                    userId, trackId, history.getContextType(), history.getContextId());

        } catch (BusinessException e) {
            // 未登录等业务异常，静默跳过
            log.debug("[播放历史] 跳过记录: {}", e.getMessage());
        } catch (Exception e) {
            // 播放历史记录失败不影响主流程
            log.error("[播放历史] 记录失败", e);
        }
    }

    /**
     * 从 SecurityContext 获取当前登录用户 ID
     */
    private Long getCurrentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof UserPrincipal principal) {
            return principal.getUserId();
        }
        throw new BusinessException(ResultCode.UNAUTHORIZED);
    }

    /**
     * 从方法参数中自动提取 trackId。
     * 优先查找名为 "id" 或 "trackId" 的参数，否则取第一个 Long 类型参数。
     */
    private Long extractTrackId(JoinPoint joinPoint) {
        MethodSignature signature = (MethodSignature) joinPoint.getSignature();
        Method method = signature.getMethod();
        Parameter[] parameters = method.getParameters();
        Object[] args = joinPoint.getArgs();

        // 优先：按参数名匹配
        for (int i = 0; i < parameters.length; i++) {
            String paramName = parameters[i].getName();
            if ("id".equals(paramName) || "trackId".equals(paramName)) {
                if (args[i] instanceof Long) {
                    return (Long) args[i];
                }
            }
        }

        // 回退：取第一个 Long 类型参数
        for (int i = 0; i < parameters.length; i++) {
            if (args[i] instanceof Long longVal) {
                return longVal;
            }
        }

        return null;
    }

    /**
     * 按参数名提取 Integer 类型的值
     */
    private Integer extractIntParam(JoinPoint joinPoint, String paramName) {
        MethodSignature signature = (MethodSignature) joinPoint.getSignature();
        Parameter[] parameters = signature.getMethod().getParameters();
        Object[] args = joinPoint.getArgs();

        for (int i = 0; i < parameters.length; i++) {
            if (paramName.equals(parameters[i].getName()) && args[i] instanceof Integer) {
                return (Integer) args[i];
            }
        }
        return null;
    }

    /**
     * 按参数名提取 Long 类型的值
     */
    private Long extractLongParam(JoinPoint joinPoint, String paramName) {
        MethodSignature signature = (MethodSignature) joinPoint.getSignature();
        Parameter[] parameters = signature.getMethod().getParameters();
        Object[] args = joinPoint.getArgs();

        for (int i = 0; i < parameters.length; i++) {
            if (paramName.equals(parameters[i].getName()) && args[i] instanceof Long) {
                return (Long) args[i];
            }
        }
        return null;
    }

    /**
     * 原子递增 tracks 表中的 play_count（play_count = play_count + 1）
     */
    private void incrementPlayCount(Long trackId) {
        try {
            LambdaUpdateWrapper<Track> wrapper = new LambdaUpdateWrapper<>();
            wrapper.setSql("play_count = play_count + 1")
                   .eq(Track::getId, trackId);
            trackMapper.update(wrapper);
        } catch (Exception e) {
            // 播放计数递增失败不影响主流程
            log.error("[播放计数] 递增失败 trackId={}", trackId, e);
        }
    }
}
