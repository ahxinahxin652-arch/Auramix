package com.son.auramix.service.analytics;

import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.function.Supplier;

/**
 * 数据看板的 Redis 缓存层.
 * <p>
 * Key 格式: auramix:analytics:{module}:{range}:{extra}
 * TTL: 5 分钟
 * <p>
 * 强制刷新: 调用方传 forceRefresh=true 跳过缓存.
 */
@Service
@RequiredArgsConstructor
public class AnalyticsCacheService {

    private static final String KEY_PREFIX = "auramix:analytics";
    private static final Duration TTL = Duration.ofMinutes(5);

    private final RedisTemplate<String, Object> redisTemplate;

    /**
     * 读取或计算. forceRefresh=true 时直接重算并覆写缓存.
     */
    @SuppressWarnings("unchecked")
    public <T> T getOrCompute(String module, String rangeLabel, String extra, boolean forceRefresh, Supplier<T> loader) {
        String key = buildKey(module, rangeLabel, extra);
        if (!forceRefresh) {
            Object cached = redisTemplate.opsForValue().get(key);
            if (cached != null) {
                try {
                    return (T) cached;
                } catch (ClassCastException ignored) {
                    // 类型不匹配时直接重新计算
                }
            }
        }
        T value = loader.get();
        if (value != null) {
            redisTemplate.opsForValue().set(key, value, TTL);
        }
        return value;
    }

    /**
     * 失效指定模块全部缓存 (简单粗暴, 用 KEYS 模式).
     */
    public void invalidate(String module) {
        String pattern = KEY_PREFIX + ":" + module + ":*";
        var keys = redisTemplate.keys(pattern);
        if (keys != null && !keys.isEmpty()) {
            redisTemplate.delete(keys);
        }
    }

    private String buildKey(String module, String rangeLabel, String extra) {
        StringBuilder sb = new StringBuilder(KEY_PREFIX)
                .append(':').append(module)
                .append(':').append(rangeLabel == null ? "default" : rangeLabel);
        if (extra != null && !extra.isEmpty()) {
            sb.append(':').append(extra);
        }
        return sb.toString();
    }
}