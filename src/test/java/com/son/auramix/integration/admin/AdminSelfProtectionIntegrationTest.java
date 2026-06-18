package com.son.auramix.integration.admin;

import com.son.auramix.common.exception.BusinessException;
import com.son.auramix.common.result.ResultCode;
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

import static org.assertj.core.api.Assertions.assertThatThrownBy;

@SpringBootTest
@Transactional
@Disabled("H2 与 MySQL DDL 不兼容，待 CI 接入 Testcontainers MySQL 后启用")
class AdminSelfProtectionIntegrationTest {

    @Autowired private AdminManageService manageService;
    @Autowired private AdminMapper adminMapper;
    @Autowired private PasswordEncoder passwordEncoder;

    @MockBean private RedisTemplate<String, Object> redisTemplate;
    @MockBean private AdminTokenStore tokenStore;

    @Test
    void rootCannotResetSelf() {
        Admin root = new Admin();
        root.setUsername("admin");
        root.setPassword(passwordEncoder.encode("root-pw"));
        root.setIsRoot(1);
        root.setStatus(1);
        adminMapper.insert(root);

        assertThatThrownBy(() -> manageService.resetPassword(root.getId(), "new-pw-12345", root.getId()))
                .isInstanceOf(BusinessException.class)
                .extracting("code").isEqualTo(ResultCode.ADMIN_CANNOT_MODIFY_SELF.getCode());
    }

    @Test
    void cannotDeactivateRoot() {
        Admin root = new Admin();
        root.setUsername("admin");
        root.setPassword(passwordEncoder.encode("root-pw"));
        root.setIsRoot(1);
        root.setStatus(1);
        adminMapper.insert(root);

        assertThatThrownBy(() -> manageService.updateStatus(root.getId(), 0, root.getId()))
                .isInstanceOf(BusinessException.class)
                .extracting("code").isEqualTo(ResultCode.ADMIN_CANNOT_MODIFY_ROOT.getCode());
    }
}
