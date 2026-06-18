package com.son.auramix.service.admin;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.son.auramix.common.exception.BusinessException;
import com.son.auramix.common.result.ResultCode;
import com.son.auramix.dto.admin.AdminLoginResponse;
import com.son.auramix.dto.admin.AdminProfileResponse;
import com.son.auramix.entity.Admin;
import com.son.auramix.mapper.AdminMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class AdminAuthService {

    private final AdminMapper adminMapper;
    private final AdminTokenStore tokenStore;
    private final PasswordEncoder passwordEncoder;

    @Value("${auramix.admin.token.ttl-seconds:7200}")
    private long ttlSeconds;

    public AdminLoginResponse login(String username, String rawPassword, String clientIp) {
        Admin admin = adminMapper.selectOne(
                new LambdaQueryWrapper<Admin>().eq(Admin::getUsername, username));
        if (admin == null) {
            log.warn("[AdminAuthService] login failed: username not found: {}", username);
            throw new BusinessException(ResultCode.ADMIN_BAD_CREDENTIALS);
        }
        if (admin.getStatus() == null || admin.getStatus() == 0) {
            log.warn("[AdminAuthService] login rejected: admin disabled, id={}", admin.getId());
            throw new BusinessException(ResultCode.ADMIN_DISABLED);
        }
        if (!passwordEncoder.matches(rawPassword, admin.getPassword())) {
            log.warn("[AdminAuthService] login failed: bad password, id={}", admin.getId());
            throw new BusinessException(ResultCode.ADMIN_BAD_CREDENTIALS);
        }

        String token = UUID.randomUUID().toString().replace("-", "");
        AdminSessionInfo info = AdminSessionInfo.builder()
                .id(admin.getId())
                .username(admin.getUsername())
                .isRoot(admin.getIsRoot())
                .loginIp(clientIp)
                .loginTime(LocalDateTime.now())
                .build();
        tokenStore.saveToken(token, info);

        // 更新最后登录信息（失败不回滚 token，登录仍算成功）
        try {
            admin.setLastLoginIp(clientIp);
            admin.setLastLoginTime(LocalDateTime.now());
            adminMapper.updateById(admin);
        } catch (Exception e) {
            log.warn("[AdminAuthService] update last_login failed, id={}", admin.getId(), e);
        }

        return AdminLoginResponse.builder()
                .token(token)
                .expiresAt(LocalDateTime.now().plusSeconds(ttlSeconds))
                .profile(toProfile(admin))
                .build();
    }

    public void logout(Integer adminId, String token) {
        tokenStore.revokeToken(adminId, token);
    }

    public AdminProfileResponse getProfile(Integer adminId) {
        Admin admin = adminMapper.selectById(adminId);
        if (admin == null) {
            throw new BusinessException(ResultCode.ADMIN_NOT_FOUND);
        }
        return toProfile(admin);
    }

    private AdminProfileResponse toProfile(Admin admin) {
        return AdminProfileResponse.builder()
                .id(admin.getId())
                .username(admin.getUsername())
                .email(admin.getEmail())
                .isRoot(admin.getIsRoot())
                .status(admin.getStatus())
                .lastLoginTime(admin.getLastLoginTime())
                .lastLoginIp(admin.getLastLoginIp())
                .createdAt(admin.getCreatedAt())
                .build();
    }
}
