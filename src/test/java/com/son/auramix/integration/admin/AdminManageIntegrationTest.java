package com.son.auramix.integration.admin;

import com.son.auramix.domain.dto.admin.AdminCreateDTO;
import com.son.auramix.domain.entity.Admin;
import com.son.auramix.mapper.AdminMapper;
import com.son.auramix.service.admin.AdminManageService;
import com.son.auramix.service.admin.AdminTokenStore;
import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;

@SpringBootTest
@Transactional
@Disabled("H2 与 MySQL DDL 不兼容，待 CI 接入 Testcontainers MySQL 后启用")
class AdminManageIntegrationTest {

    @Autowired private AdminManageService manageService;
    @Autowired private AdminMapper adminMapper;
    @Autowired private PasswordEncoder passwordEncoder;

    @MockBean private RedisTemplate<String, Object> redisTemplate;
    @MockBean private AdminTokenStore tokenStore;

    @Test
    void rootCreateAndResetAndDeactivate() {
        Admin root = new Admin();
        root.setUsername("admin");
        root.setPassword(passwordEncoder.encode("root-pw"));
        root.setIsRoot(1);
        root.setStatus(1);
        adminMapper.insert(root);

        AdminCreateDTO req = new AdminCreateDTO();
        req.setUsername("alice");
        req.setPassword("alice-pw-123");
        req.setEmail("a@x.com");
        var created = manageService.createAdmin(req);
        assertThat(created.getId()).isNotNull();

        manageService.resetPassword(created.getId(), "new-pw-12345", root.getId());
        verify(tokenStore, times(1)).revokeAllTokens(created.getId());

        manageService.updateStatus(created.getId(), 0, root.getId());
        verify(tokenStore, times(2)).revokeAllTokens(created.getId());
    }
}
