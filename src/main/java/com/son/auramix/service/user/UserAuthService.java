package com.son.auramix.service.user;

import cn.hutool.core.util.RandomUtil;
import cn.hutool.core.util.StrUtil;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.son.auramix.common.exception.BusinessException;
import com.son.auramix.common.result.ResultCode;
import com.son.auramix.domain.vo.user.UserLoginVO;
import com.son.auramix.domain.vo.user.UserProfileVO;
import com.son.auramix.domain.entity.User;
import com.son.auramix.mapper.UserMapper;
import com.son.auramix.service.recommend.UserPreferenceService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * 用户认证服务：注册、登录、登出、验证码
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class UserAuthService {

    private static final String CODE_KEY_PREFIX = "user:code:";
    private static final Duration CODE_TTL = Duration.ofMinutes(5);
    private static final Duration CODE_RATE_LIMIT = Duration.ofSeconds(60);

    private final UserMapper userMapper;
    private final UserTokenStore tokenStore;
    private final PasswordEncoder passwordEncoder;
    private final StringRedisTemplate stringRedisTemplate;
    private final UserPreferenceService userPreferenceService;

    @Value("${auramix.user.token.ttl-seconds:2592000}")
    private long ttlSeconds;

    // ============================ 发送验证码 ============================

    /**
     * 发送邮箱验证码（不区分注册/找回密码，调用方自行控制场景）
     */
    public void sendVerificationCode(String email, EmailService emailService) {
        // 频率限制：同一邮箱 60 秒内只能发一次
        String rateLimitKey = CODE_KEY_PREFIX + "limit:" + email;
        if (Boolean.TRUE.equals(stringRedisTemplate.hasKey(rateLimitKey))) {
            throw new BusinessException(ResultCode.USER_CODE_TOO_FREQUENT);
        }

        // 生成 6 位数字验证码
        String code = RandomUtil.randomNumbers(6);

        // 存入 Redis，5 分钟过期
        String codeKey = CODE_KEY_PREFIX + email;
        stringRedisTemplate.opsForValue().set(codeKey, code, CODE_TTL);

        // 设置频率限制
        stringRedisTemplate.opsForValue().set(rateLimitKey, "1", CODE_RATE_LIMIT);

        // 发送邮件
        emailService.sendVerificationCode(email, code);
    }

    // ============================ 注册 ============================

    public UserLoginVO register(String email, String rawPassword, String displayName, String code, String clientIp) {
        // 校验验证码
        verifyCode(email, code);

        // 查重
        if (userMapper.selectCount(new LambdaQueryWrapper<User>().eq(User::getEmail, email)) > 0) {
            throw new BusinessException(ResultCode.USER_EMAIL_TAKEN);
        }

        // 创建用户
        User user = new User();
        user.setEmail(email);
        user.setPasswordHash(passwordEncoder.encode(rawPassword));
        user.setDisplayName(displayName);
        user.setProduct(0); // 默认免费用户
        user.setStatus(User.STATUS_ACTIVE);
        userMapper.insert(user);

        log.info("[UserAuthService] 注册成功, email={}, id={}", email, user.getId());

        // 删除已使用的验证码
        stringRedisTemplate.delete(CODE_KEY_PREFIX + email);

        // 注册后自动登录
        return buildLoginResponse(user, clientIp);
    }

    // ============================ 登录 ============================

    public UserLoginVO login(String email, String rawPassword, String clientIp) {
        User user = userMapper.selectOne(
                new LambdaQueryWrapper<User>().eq(User::getEmail, email));
        if (user == null) {
            log.warn("[UserAuthService] 登录失败: 邮箱不存在, email={}", email);
            throw new BusinessException(ResultCode.USER_BAD_CREDENTIALS);
        }
        if (user.getStatus() != null && user.getStatus() == User.STATUS_BANNED) {
            log.warn("[UserAuthService] 登录失败: 账号已被封禁, email={}", email);
            throw new BusinessException(ResultCode.USER_BANNED);
        }
        if (!passwordEncoder.matches(rawPassword, user.getPasswordHash())) {
            log.warn("[UserAuthService] 登录失败: 密码错误, email={}", email);
            throw new BusinessException(ResultCode.USER_BAD_CREDENTIALS);
        }

        log.info("[UserAuthService] 登录成功, email={}, id={}", email, user.getId());
        return buildLoginResponse(user, clientIp);
    }

    // ============================ 登出 ============================

    public void logout(Long userId, String token) {
        tokenStore.revokeToken(userId, token);
    }

    // ============================ 获取信息 ============================

    public UserProfileVO getProfile(Long userId) {
        User user = userMapper.selectById(userId);
        if (user == null) {
            throw new BusinessException(ResultCode.USER_NOT_FOUND);
        }
        return toProfile(user);
    }

    // ============================ Token 验证 ============================

    public UserSessionInfo loadSession(String token) {
        return tokenStore.loadToken(token);
    }

    // ============================ 私有方法 ============================

    private void verifyCode(String email, String code) {
        String key = CODE_KEY_PREFIX + email;
        String storedCode = stringRedisTemplate.opsForValue().get(key);
        if (StrUtil.isBlank(storedCode) || !storedCode.equals(code)) {
            throw new BusinessException(ResultCode.USER_CODE_INVALID);
        }
    }

    private UserLoginVO buildLoginResponse(User user, String clientIp) {
        String token = UUID.randomUUID().toString().replace("-", "");
        UserSessionInfo info = UserSessionInfo.builder()
                .id(user.getId())
                .email(user.getEmail())
                .loginIp(clientIp)
                .loginTime(LocalDateTime.now())
                .build();
        tokenStore.saveToken(token, info);

        // 登录时缓存用户偏好向量和每日推荐到 Redis（TTL 至当日 00:00）
        userPreferenceService.cacheOnLogin(user.getId());

        return UserLoginVO.builder()
                .token(token)
                .expiresAt(LocalDateTime.now().plusSeconds(ttlSeconds))
                .profile(toProfile(user))
                .build();
    }

    private UserProfileVO toProfile(User user) {
        return UserProfileVO.builder()
                .id(user.getId())
                .email(user.getEmail())
                .displayName(user.getDisplayName())
                .avatarUrl(user.getAvatarUrl())
                .country(user.getCountry())
                .product(user.getProduct())
                .createdAt(user.getCreatedAt())
                .build();
    }
}
