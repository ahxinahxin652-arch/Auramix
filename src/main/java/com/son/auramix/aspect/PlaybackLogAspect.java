package com.son.auramix.aspect;

import com.son.auramix.annotation.AfterLog;
import com.son.auramix.common.exception.BusinessException;
import com.son.auramix.common.result.ResultCode;
import com.son.auramix.domain.entity.PlaybackHistory;
import com.son.auramix.mapper.PlaybackHistoryMapper;
import com.son.auramix.security.user.UserPrincipal;
import lombok.RequiredArgsConstructor;
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
@RequiredArgsConstructor
public class PlaybackLogAspect {

    private final PlaybackHistoryMapper playbackHistoryMapper;

    @Pointcut("@annotation(com.son.auramix.annotation.AfterLog)")
    public void afterLogPointcut() {}

    /**
     * 在标注了 @AfterLog 的方法成功返回后，自动记录用户播放历史
     */
    @AfterReturning(pointcut = "afterLogPointcut() && @annotation(afterLog)", returning = "result")
    public void afterReturning(JoinPoint joinPoint, AfterLog afterLog, Object result) {
        try {
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

            // 4. 设置播放上下文
            int contextType = afterLog.contextType();
            if (contextType >= 0) {
                history.setContextType(contextType);
            }
            long contextId = afterLog.contextId();
            if (contextId > 0) {
                history.setContextId(contextId);
            }

            // 5. 写入数据库
            playbackHistoryMapper.insert(history);

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
}
