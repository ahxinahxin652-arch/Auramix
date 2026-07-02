package com.son.auramix.aspect;

import com.son.auramix.annotation.AfterLog;
import com.son.auramix.common.exception.BusinessException;
import com.son.auramix.common.result.PageResult;
import com.son.auramix.common.result.Result;
import com.son.auramix.common.result.ResultCode;
import com.son.auramix.domain.entity.UserBehaviorLog;
import com.son.auramix.domain.vo.user.GlobalSearchVO;
import com.son.auramix.domain.vo.user.UserTrackSearchVO;
import com.son.auramix.mapper.UserBehaviorLogMapper;
import com.son.auramix.security.user.UserPrincipal;
import jakarta.servlet.http.HttpServletRequest;
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
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.lang.reflect.Parameter;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

/**
 * 用户行为日志切面
 * 监听 @AfterLog 注解，在方法成功返回后记录用户行为到 user_behavior_logs 表
 * <p>
 * 行为类型: 0=播放, 1=收藏, 2=取消收藏, 3=跳过, 4=完整听完, 5=搜索, 6=分享, 7=添加到歌单
 */
@Aspect
@Slf4j
@Component
@RequiredArgsConstructor
public class UserBehaviorLogAspect {

    private final UserBehaviorLogMapper userBehaviorLogMapper;

    @Pointcut("@annotation(com.son.auramix.annotation.AfterLog)")
    public void afterLogPointcut() {}

    @AfterReturning(pointcut = "afterLogPointcut() && @annotation(afterLog)", returning = "result")
    public void afterReturning(JoinPoint joinPoint, AfterLog afterLog, Object result) {
        try {
            // 1. 获取当前登录用户 ID
            Long userId = getCurrentUserId();

            // 2. 获取行为类型（-1 表示未指定，跳过）
            int behaviorType = afterLog.behaviorType();
            if (behaviorType < 0) {
                log.debug("[行为日志] behaviorType 未指定，跳过记录");
                return;
            }

            // 3. 上下文（来源页面）：优先取请求参数，回退注解值
            String context = getRequestParam("context");
            if (context == null || context.isBlank()) {
                context = afterLog.context();
            }

            // 4. 搜索行为：从返回值中提取 tracks 逐条写入
            if (behaviorType == 5) {
                List<TrackInfo> trackInfos = extractTracksFromResult(result);
                for (TrackInfo info : trackInfos) {
                    UserBehaviorLog logEntry = buildLogEntry(userId, behaviorType, info.trackId, context, info.duration);
                    userBehaviorLogMapper.insert(logEntry);
                    log.debug("[行为日志] userId={}, behavior={}, trackId={}, context={}, duration={}",
                            userId, behaviorType, info.trackId, logEntry.getContext(), logEntry.getBehaviorDuration());
                }
                log.debug("[行为日志] 搜索记录 {} 条", trackInfos.size());
                return;
            }

            // 5. 非搜索行为：从方法参数中提取 trackId
            Long trackId = extractTrackId(joinPoint);

            // 6. 行为持续时长（从请求参数提取 duration）
            Integer duration = parseRequestInt("duration");

            // 7. 构建并写入
            UserBehaviorLog logEntry = buildLogEntry(userId, behaviorType, trackId, context, duration);
            userBehaviorLogMapper.insert(logEntry);

            log.debug("[行为日志] userId={}, behavior={}, trackId={}, context={}, duration={}",
                    userId, behaviorType, trackId, logEntry.getContext(), logEntry.getBehaviorDuration());

        } catch (BusinessException e) {
            log.debug("[行为日志] 跳过记录: {}", e.getMessage());
        } catch (Exception e) {
            log.error("[行为日志] 记录失败", e);
        }
    }

    private UserBehaviorLog buildLogEntry(Long userId, int behaviorType, Long trackId, String context, Integer duration) {
        UserBehaviorLog entry = new UserBehaviorLog();
        entry.setUserId(userId);
        entry.setTrackId(trackId);
        entry.setBehaviorType(behaviorType);
        entry.setCreatedAt(LocalDateTime.now());
        if (context != null && !context.isBlank()) {
            entry.setContext(context);
        }
        // 行为持续时长策略:
        //   behavior_type 0 (播放) → 固定为 0（刚开始播放）
        //   behavior_type 1,2,5,6,7 → 设 null（收藏/取消收藏/搜索/分享/添加到歌单，无持续时长概念）
        //   behavior_type 3,4    → 保留原有逻辑（跳过/完整听完，由 playback-end 上报设置）
        if (behaviorType == UserBehaviorLog.BEHAVIOR_PLAY) {
            entry.setBehaviorDuration(0);
        } else if (behaviorType == UserBehaviorLog.BEHAVIOR_SKIP
                || behaviorType == UserBehaviorLog.BEHAVIOR_FULL_LISTEN) {
            if (duration != null && duration > 0) {
                entry.setBehaviorDuration(duration);
            }
        }
        // behaviorType 1,2,5,6,7: 不设置 behaviorDuration，保持 null
        return entry;
    }

    /**
     * 从搜索返回值中提取 track 列表（id + duration）
     * 支持 GlobalSearchVO（searchAll）和 PageResult\<UserTrackSearchVO\>（searchTracks）
     */
    @SuppressWarnings("unchecked")
    private List<TrackInfo> extractTracksFromResult(Object result) {
        if (!(result instanceof Result<?> r)) {
            return Collections.emptyList();
        }
        Object data = r.getData();
        if (data == null) {
            return Collections.emptyList();
        }

        List<TrackInfo> trackInfos = new ArrayList<>();

        // searchAll 返回 GlobalSearchVO
        if (data instanceof GlobalSearchVO vo) {
            if (vo.getTracks() != null) {
                for (UserTrackSearchVO track : vo.getTracks()) {
                    trackInfos.add(new TrackInfo(track.getId(), track.getDuration()));
                }
            }
        }
        // searchTracks 返回 PageResult<UserTrackSearchVO>
        else if (data instanceof PageResult<?> page) {
            if (page.getRecords() != null && !page.getRecords().isEmpty()
                    && page.getRecords().get(0) instanceof UserTrackSearchVO) {
                for (Object item : page.getRecords()) {
                    UserTrackSearchVO track = (UserTrackSearchVO) item;
                    trackInfos.add(new TrackInfo(track.getId(), track.getDuration()));
                }
            }
        }

        return trackInfos;
    }

    /** 内部记录：trackId + duration */
    private record TrackInfo(Long trackId, Integer duration) {}

    private Long getCurrentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof UserPrincipal principal) {
            return principal.getUserId();
        }
        throw new BusinessException(ResultCode.UNAUTHORIZED);
    }

    /**
     * 从方法参数中提取 trackId
     * 优先查找名为 "id" 或 "trackId" 的参数，否则取第一个 Long 类型参数
     */
    private Long extractTrackId(JoinPoint joinPoint) {
        MethodSignature signature = (MethodSignature) joinPoint.getSignature();
        Parameter[] parameters = signature.getMethod().getParameters();
        Object[] args = joinPoint.getArgs();

        for (int i = 0; i < parameters.length; i++) {
            String name = parameters[i].getName();
            if ("id".equals(name) || "trackId".equals(name)) {
                if (args[i] instanceof Long longVal) {
                    return longVal;
                }
            }
        }

        for (Object arg : args) {
            if (arg instanceof Long longVal) {
                return longVal;
            }
        }

        return null;
    }

    /**
     * 从请求参数中获取字符串值
     */
    private String getRequestParam(String name) {
        HttpServletRequest request = getHttpServletRequest();
        return request != null ? request.getParameter(name) : null;
    }

    /**
     * 从请求参数中解析 Integer 值
     */
    private Integer parseRequestInt(String name) {
        String val = getRequestParam(name);
        if (val != null && !val.isBlank()) {
            try {
                return Integer.parseInt(val);
            } catch (NumberFormatException ignored) {
            }
        }
        return null;
    }

    private HttpServletRequest getHttpServletRequest() {
        ServletRequestAttributes attrs = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
        return attrs != null ? attrs.getRequest() : null;
    }
}
