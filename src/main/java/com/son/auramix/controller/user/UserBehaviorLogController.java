package com.son.auramix.controller.user;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.conditions.update.LambdaUpdateWrapper;
import com.son.auramix.common.exception.BusinessException;
import com.son.auramix.common.result.Result;
import com.son.auramix.common.result.ResultCode;
import com.son.auramix.domain.dto.user.PlaybackEndDTO;
import com.son.auramix.domain.entity.UserBehaviorLog;
import com.son.auramix.mapper.UserBehaviorLogMapper;
import com.son.auramix.security.user.UserPrincipal;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.TimeUnit;

/**
 * C 端用户行为日志接口: /api/user/behavior/**
 * <p>
 * 使用结束时上报模式：只有触发了结束事件（NEXT/STOP/COMPLETE/CLOSE）才写 MySQL，
 * 否则仅更新 Redis 缓存中的当前播放状态。
 */
@Slf4j
@RestController
@RequestMapping("/api/user/behavior")
@RequiredArgsConstructor
public class UserBehaviorLogController {

    private final UserBehaviorLogMapper userBehaviorLogMapper;
    private final RedisTemplate<String, Object> redisTemplate;

    private static final String REDIS_KEY_PREFIX = "playback:status:";
    private static final long REDIS_TTL_MINUTES = 60;

    /**
     * 播放结束上报
     * <p>
     * 根据 eventType 决定写 MySQL 还是仅更新 Redis：
     * <ul>
     *   <li>NEXT / STOP / COMPLETE / CLOSE → 更新 MySQL 中 user_behavior_logs 记录</li>
     *   <li>其他（空字符串等） → 仅更新 Redis 缓存</li>
     * </ul>
     */
    @PostMapping("/playback-end")
    public Result<Void> playbackEnd(@Valid @RequestBody PlaybackEndDTO dto) {
        Long currentUserId = getCurrentUserId();
        // 优先使用安全上下文中的 userId，回退到 DTO 中的值
        Long userId = dto.getUserId() != null ? dto.getUserId() : currentUserId;
        Long trackId = dto.getTrackId();
        int playDuration = dto.getPlayDuration() != null ? dto.getPlayDuration() : 0;
        int totalDuration = dto.getTotalDuration() != null ? dto.getTotalDuration() : 0;
        String eventType = dto.getEventType() != null ? dto.getEventType().trim().toUpperCase() : "";

        boolean isEndingEvent = "NEXT".equals(eventType) || "STOP".equals(eventType)
                || "COMPLETE".equals(eventType) || "CLOSE".equals(eventType);

        if (isEndingEvent) {
            updateBehaviorLog(userId, trackId, playDuration, totalDuration, eventType);
            redisTemplate.delete(buildRedisKey(userId, trackId));
        } else {
            updateRedisCache(userId, trackId, playDuration, totalDuration, eventType);
        }

        return Result.success(null, "上报成功");
    }

    // ============================ MySQL 更新 ============================

    /**
     * 更新 user_behavior_logs 中最近的 behavior_type=0 记录
     */
    private void updateBehaviorLog(Long userId, Long trackId, int playDuration, int totalDuration, String eventType) {
        // 查找最近一条 behavior_type=0 (播放) 的记录
        LambdaQueryWrapper<UserBehaviorLog> queryWrapper = new LambdaQueryWrapper<>();
        queryWrapper.eq(UserBehaviorLog::getUserId, userId)
                .eq(UserBehaviorLog::getTrackId, trackId)
                .eq(UserBehaviorLog::getBehaviorType, UserBehaviorLog.BEHAVIOR_PLAY)
                .orderByDesc(UserBehaviorLog::getCreatedAt)
                .last("LIMIT 1");
        UserBehaviorLog existingLog = userBehaviorLogMapper.selectOne(queryWrapper);

        if (existingLog == null) {
            log.warn("[行为日志] 未找到播放记录 userId={}, trackId={}", userId, trackId);
            return;
        }

        int newBehaviorType = determineBehaviorType(playDuration, totalDuration, eventType);

        LambdaUpdateWrapper<UserBehaviorLog> updateWrapper = new LambdaUpdateWrapper<>();
        updateWrapper.eq(UserBehaviorLog::getId, existingLog.getId())
                .set(UserBehaviorLog::getBehaviorType, newBehaviorType)
                .set(UserBehaviorLog::getBehaviorDuration, playDuration);
        userBehaviorLogMapper.update(null, updateWrapper);

        log.debug("[行为日志] 更新播放记录 id={}, userId={}, trackId={}, behaviorType={}, duration={}, event={}",
                existingLog.getId(), userId, trackId, newBehaviorType, playDuration, eventType);
    }

    /**
     * 根据 playDuration / totalDuration / eventType 判定最终 behavior_type
     * <ul>
     *   <li>4 (FULL_LISTEN): COMPLETE 事件 / 已播 >= 总时长*0.8 / 长歌(>5min)已播>=120s / 剩余<0.5s</li>
     *   <li>3 (SKIP): 已播 < 总时长*0.6</li>
     *   <li>0 (PLAY): 其他中间情况，仅更新 duration</li>
     * </ul>
     */
    private int determineBehaviorType(int playDuration, int totalDuration, String eventType) {
        // COMPLETE 事件：自然播放完毕 → FULL_LISTEN
        if ("COMPLETE".equals(eventType)) {
            return UserBehaviorLog.BEHAVIOR_FULL_LISTEN;
        }

        if (totalDuration > 0) {
            // 条件1: 已播时长 >= 总时长 * 0.6
            if (playDuration >= totalDuration * 0.6) {
                return UserBehaviorLog.BEHAVIOR_FULL_LISTEN;
            }
            // 条件2: 针对总时长 5 分钟以上的歌曲，已播 >= 120 秒
            if (totalDuration > 300 && playDuration >= 120) {
                return UserBehaviorLog.BEHAVIOR_FULL_LISTEN;
            }
            // 条件3: 播放到末尾自动停止（剩余时间 < 0.5 秒）
            if (totalDuration - playDuration < 0.5) {
                return UserBehaviorLog.BEHAVIOR_FULL_LISTEN;
            }
            // SKIP: 已播时长 < 总时长 * 0.6
            if (playDuration < totalDuration * 0.6) {
                return UserBehaviorLog.BEHAVIOR_SKIP;
            }
        }

        // 中间区间（0.6 ~ 0.8）或 totalDuration 未知：保持 PLAY，仅更新 duration
        return UserBehaviorLog.BEHAVIOR_PLAY;
    }

    // ============================ Redis 缓存 ============================

    /**
     * 仅更新 Redis 中的播放状态（非结束事件时调用）
     */
    private void updateRedisCache(Long userId, Long trackId, int playDuration, int totalDuration, String eventType) {
        String key = buildRedisKey(userId, trackId);
        Map<String, Object> status = new HashMap<>();
        status.put("userId", userId);
        status.put("trackId", trackId);
        status.put("playDuration", playDuration);
        status.put("totalDuration", totalDuration);
        status.put("eventType", eventType);
        status.put("updatedAt", System.currentTimeMillis());
        redisTemplate.opsForValue().set(key, status, REDIS_TTL_MINUTES, TimeUnit.MINUTES);
    }

    private String buildRedisKey(Long userId, Long trackId) {
        return REDIS_KEY_PREFIX + userId + ":" + trackId;
    }

    // ============================ 工具 ============================

    private Long getCurrentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof UserPrincipal principal) {
            return principal.getUserId();
        }
        throw new BusinessException(ResultCode.UNAUTHORIZED);
    }
}
