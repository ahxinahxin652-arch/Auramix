package com.son.auramix.service.admin;

import com.baomidou.mybatisplus.core.conditions.Wrapper;
import com.son.auramix.common.exception.BusinessException;
import com.son.auramix.common.result.ResultCode;
import com.son.auramix.domain.dto.admin.AdminLoginResponse;
import com.son.auramix.domain.entity.Admin;
import com.son.auramix.mapper.AdminMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.LocalDateTime;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AdminAuthServiceTest {

    @Mock private AdminMapper adminMapper;
    @Mock private AdminTokenStore tokenStore;
    @Mock private PasswordEncoder passwordEncoder;

    @InjectMocks
    private AdminAuthService authService;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(authService, "ttlSeconds", 7200L);
    }

    private Admin sampleAdmin(int id, String username, String hash, int isRoot, int status) {
        Admin a = new Admin();
        a.setId(id);
        a.setUsername(username);
        a.setPassword(hash);
        a.setIsRoot(isRoot);
        a.setStatus(status);
        a.setCreatedAt(LocalDateTime.of(2026, 1, 1, 0, 0));
        return a;
    }

    @Test
    void login_throwsBadCredentialsWhenAdminNotFound() {
        when(adminMapper.selectOne(any(Wrapper.class))).thenReturn(null);

        assertThatThrownBy(() -> authService.login("nope", "pw", "1.1.1.1"))
                .isInstanceOf(BusinessException.class)
                .extracting("code").isEqualTo(ResultCode.ADMIN_BAD_CREDENTIALS.getCode());

        verify(tokenStore, never()).saveToken(anyString(), any());
    }

    @Test
    void login_throwsDisabledWhenStatusZero() {
        Admin a = sampleAdmin(1, "bob", "hash", 0, 0);
        when(adminMapper.selectOne(any(Wrapper.class))).thenReturn(a);

        assertThatThrownBy(() -> authService.login("bob", "pw", "1.1.1.1"))
                .isInstanceOf(BusinessException.class)
                .extracting("code").isEqualTo(ResultCode.ADMIN_DISABLED.getCode());
    }

    @Test
    void login_throwsBadCredentialsWhenPasswordMismatch() {
        Admin a = sampleAdmin(1, "bob", "hash", 0, 1);
        when(adminMapper.selectOne(any(Wrapper.class))).thenReturn(a);
        when(passwordEncoder.matches("pw", "hash")).thenReturn(false);

        assertThatThrownBy(() -> authService.login("bob", "pw", "1.1.1.1"))
                .isInstanceOf(BusinessException.class)
                .extracting("code").isEqualTo(ResultCode.ADMIN_BAD_CREDENTIALS.getCode());
    }

    @Test
    void login_succeedsAndSavesToken() {
        Admin a = sampleAdmin(1, "bob", "hash", 1, 1);
        when(adminMapper.selectOne(any(Wrapper.class))).thenReturn(a);
        when(passwordEncoder.matches("pw", "hash")).thenReturn(true);

        AdminLoginResponse resp = authService.login("bob", "pw", "1.1.1.1");

        assertThat(resp.getToken()).isNotBlank();
        assertThat(resp.getProfile().getId()).isEqualTo(1);
        assertThat(resp.getProfile().getIsRoot()).isEqualTo(1);
        assertThat(resp.getExpiresAt()).isAfter(LocalDateTime.now());

        ArgumentCaptor<AdminSessionInfo> cap = ArgumentCaptor.forClass(AdminSessionInfo.class);
        verify(tokenStore).saveToken(eq(resp.getToken()), cap.capture());
        assertThat(cap.getValue().getId()).isEqualTo(1);
        assertThat(cap.getValue().getLoginIp()).isEqualTo("1.1.1.1");
        assertThat(cap.getValue().getIsRoot()).isEqualTo(1);

        verify(adminMapper).updateById(any(Admin.class));
    }
}
