package com.son.auramix.service.admin;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.util.Set;

/**
 * 管理员 Token 在 Redis 中的双键封装：
 * <ul>
 *   <li>正向：{@code admin:token:{token}} -> JSON 会话信息（含 TTL 滑动）</li>
 *   <li>反向：{@code admin:tokens:{adminId}} -> Set<token>（用于踢人）</li>
 * </ul>
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class AdminTokenStore {

    private static final String TOKEN_KEY_PREFIX = "admin:token:";
    private static final String TOKENS_KEY_PREFIX = "admin:tokens:";

    private final RedisTemplate<String, Object> redisTemplate;

    @Value("${auramix.admin.token.ttl-seconds:7200}")
    private long ttlSeconds;

    /** 保存新会话：写正向 + 加入反向集合 */
    public void saveToken(String token, AdminSessionInfo info) {
        Duration ttl = Duration.ofSeconds(ttlSeconds);
        redisTemplate.opsForValue().set(TOKEN_KEY_PREFIX + token, info, ttl);
        redisTemplate.opsForSet().add(TOKENS_KEY_PREFIX + info.getId(), token);
        log.debug("[AdminTokenStore] saved token for adminId={}", info.getId());
    }

    /** 读取会话；命中则滑动 TTL，未命中返回 null */
    public AdminSessionInfo loadToken(String token) {
        String key = TOKEN_KEY_PREFIX + token;
        AdminSessionInfo info = (AdminSessionInfo) redisTemplate.opsForValue().get(key);
        if (info != null) {
            redisTemplate.expire(key, Duration.ofSeconds(ttlSeconds));
        }
        return info;
    }

    /** 撤销该 admin 的所有 token（用于重置密码 / 停用） */
    public void revokeAllTokens(Integer adminId) {
        String reverseKey = TOKENS_KEY_PREFIX + adminId;
        @SuppressWarnings({"unchecked", "rawtypes"})
        Set<String> tokens = (Set<String>) (Set) redisTemplate.opsForSet().members(reverseKey);
        if (tokens != null) {
            for (String t : tokens) {
                redisTemplate.delete(TOKEN_KEY_PREFIX + t);
            }
        }
        redisTemplate.delete(reverseKey);
        log.info("[AdminTokenStore] revoked all tokens for adminId={}, count={}",
                adminId, tokens == null ? 0 : tokens.size());
    }

    /** 撤销单个 token（登出） */
    public void revokeToken(Integer adminId, String token) {
        redisTemplate.delete(TOKEN_KEY_PREFIX + token);
        redisTemplate.opsForSet().remove(TOKENS_KEY_PREFIX + adminId, token);
        log.debug("[AdminTokenStore] revoked token for adminId={}", adminId);
    }
}
