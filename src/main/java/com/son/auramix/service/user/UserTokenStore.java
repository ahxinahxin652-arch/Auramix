package com.son.auramix.service.user;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.util.Set;

/**
 * 用户 Token 在 Redis 中的双键封装：
 * <ul>
 *   <li>正向：{@code user:token:{token}} -> JSON 会话信息（含 TTL 滑动）</li>
 *   <li>反向：{@code user:tokens:{userId}} -> Set&lt;token&gt;（用于踢人）</li>
 * </ul>
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class UserTokenStore {

    private static final String TOKEN_KEY_PREFIX = "user:token:";
    private static final String TOKENS_KEY_PREFIX = "user:tokens:";

    private final RedisTemplate<String, Object> redisTemplate;

    @Value("${auramix.user.token.ttl-seconds:2592000}")
    private long ttlSeconds;

    /** 保存新会话：写正向 + 加入反向集合 */
    public void saveToken(String token, UserSessionInfo info) {
        Duration ttl = Duration.ofSeconds(ttlSeconds);
        redisTemplate.opsForValue().set(TOKEN_KEY_PREFIX + token, info, ttl);
        redisTemplate.opsForSet().add(TOKENS_KEY_PREFIX + info.getId(), token);
        log.debug("[UserTokenStore] saved token for userId={}", info.getId());
    }

    /** 读取会话；命中则滑动 TTL，未命中返回 null */
    public UserSessionInfo loadToken(String token) {
        String key = TOKEN_KEY_PREFIX + token;
        UserSessionInfo info = (UserSessionInfo) redisTemplate.opsForValue().get(key);
        if (info != null) {
            redisTemplate.expire(key, Duration.ofSeconds(ttlSeconds));
        }
        return info;
    }

    /** 撤销该用户的所有 token */
    public void revokeAllTokens(Long userId) {
        String reverseKey = TOKENS_KEY_PREFIX + userId;
        @SuppressWarnings({"unchecked", "rawtypes"})
        Set<String> tokens = (Set<String>) (Set) redisTemplate.opsForSet().members(reverseKey);
        if (tokens != null) {
            for (String t : tokens) {
                redisTemplate.delete(TOKEN_KEY_PREFIX + t);
            }
        }
        redisTemplate.delete(reverseKey);
        log.info("[UserTokenStore] revoked all tokens for userId={}, count={}",
                userId, tokens == null ? 0 : tokens.size());
    }

    /** 撤销单个 token（登出） */
    public void revokeToken(Long userId, String token) {
        redisTemplate.delete(TOKEN_KEY_PREFIX + token);
        redisTemplate.opsForSet().remove(TOKENS_KEY_PREFIX + userId, token);
        log.debug("[UserTokenStore] revoked token for userId={}", userId);
    }
}
