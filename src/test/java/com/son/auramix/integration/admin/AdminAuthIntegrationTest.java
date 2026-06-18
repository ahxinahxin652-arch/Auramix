package com.son.auramix.integration.admin;

import com.son.auramix.domain.dto.admin.AdminLoginResponse;
import com.son.auramix.domain.entity.Admin;
import com.son.auramix.mapper.AdminMapper;
import com.son.auramix.service.admin.AdminAuthService;
import com.son.auramix.service.admin.AdminSessionInfo;
import com.son.auramix.service.admin.AdminTokenStore;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.doNothing;

@SpringBootTest
@Transactional
@Disabled("H2 与 MySQL DDL 不兼容，待 CI 接入 Testcontainers MySQL 后启用")
class AdminAuthIntegrationTest {

    @Autowired private AdminAuthService authService;
    @Autowired private AdminMapper adminMapper;
    @Autowired private PasswordEncoder passwordEncoder;

    @MockBean private RedisTemplate<String, Object> redisTemplate;
    @MockBean private AdminTokenStore tokenStore;

    @BeforeEach
    void setUp() {
        // 由于 RedisTemplate 是 Mock，saveToken/revokeToken 走 no-op
        doNothing().when(tokenStore).saveToken(anyString(), any(AdminSessionInfo.class));
    }

    @Test
    void login_logout_me_flow() {
        // 准备：插入初始管理员
        Admin root = new Admin();
        root.setUsername("admin");
        root.setPassword(passwordEncoder.encode("password123"));
        root.setIsRoot(1);
        root.setStatus(1);
        adminMapper.insert(root);

        // 登录
        AdminLoginResponse login = authService.login("admin", "password123", "127.0.0.1");
        assertThat(login.getToken()).isNotBlank();
        assertThat(login.getProfile().getIsRoot()).isEqualTo(1);

        // me：直接走 service.getProfile
        var profile = authService.getProfile(root.getId());
        assertThat(profile.getUsername()).isEqualTo("admin");

        // 登出（不报错即可）
        authService.logout(root.getId(), login.getToken());
    }
}
