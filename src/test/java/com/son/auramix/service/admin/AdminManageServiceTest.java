package com.son.auramix.service.admin;

import com.baomidou.mybatisplus.core.conditions.Wrapper;
import com.son.auramix.common.exception.BusinessException;
import com.son.auramix.common.result.ResultCode;
import com.son.auramix.domain.dto.admin.AdminCreateRequest;
import com.son.auramix.domain.entity.Admin;
import com.son.auramix.mapper.AdminMapper;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AdminManageServiceTest {

    @Mock private AdminMapper adminMapper;
    @Mock private AdminTokenStore tokenStore;
    @Mock private PasswordEncoder passwordEncoder;

    @InjectMocks
    private AdminManageService service;

    private Admin admin(int id, int isRoot, int status) {
        Admin a = new Admin();
        a.setId(id);
        a.setUsername("u" + id);
        a.setIsRoot(isRoot);
        a.setStatus(status);
        a.setPassword("hash");
        return a;
    }

    // ============ create ============

    @Test
    void create_throwsUsernameTaken() {
        when(adminMapper.selectCount(any(Wrapper.class))).thenReturn(1L);

        AdminCreateRequest req = new AdminCreateRequest();
        req.setUsername("alice");
        req.setPassword("password123");
        req.setEmail("a@x.com");

        assertThatThrownBy(() -> service.createAdmin(req))
                .isInstanceOf(BusinessException.class)
                .extracting("code").isEqualTo(ResultCode.ADMIN_USERNAME_TAKEN.getCode());

        verify(adminMapper, never()).insert(any(Admin.class));
    }

    @Test
    void create_throwsEmailTaken() {
        // 第一次 selectCount(username) -> 0; 第二次 selectCount(email) -> 1
        when(adminMapper.selectCount(any(Wrapper.class)))
                .thenReturn(0L, 1L);

        AdminCreateRequest req = new AdminCreateRequest();
        req.setUsername("alice");
        req.setPassword("password123");
        req.setEmail("a@x.com");

        assertThatThrownBy(() -> service.createAdmin(req))
                .isInstanceOf(BusinessException.class)
                .extracting("code").isEqualTo(ResultCode.ADMIN_EMAIL_TAKEN.getCode());
    }

    @Test
    void create_succeedsAndInserts() {
        when(adminMapper.selectCount(any(Wrapper.class))).thenReturn(0L);
        when(passwordEncoder.encode("password123")).thenReturn("HASH");

        AdminCreateRequest req = new AdminCreateRequest();
        req.setUsername("alice");
        req.setPassword("password123");
        req.setEmail("a@x.com");

        service.createAdmin(req);

        ArgumentCaptor<Admin> cap = ArgumentCaptor.forClass(Admin.class);
        verify(adminMapper).insert(cap.capture());
        Admin inserted = cap.getValue();
        assertThat(inserted.getUsername()).isEqualTo("alice");
        assertThat(inserted.getEmail()).isEqualTo("a@x.com");
        assertThat(inserted.getPassword()).isEqualTo("HASH");
        assertThat(inserted.getIsRoot()).isEqualTo(0);
        assertThat(inserted.getStatus()).isEqualTo(1);
    }

    // ============ resetPassword ============

    @Test
    void resetPassword_throwsSelfProtection() {
        Admin target = admin(5, 0, 1);
        when(adminMapper.selectById(5)).thenReturn(target);

        assertThatThrownBy(() -> service.resetPassword(5, "newpassword", 5))
                .isInstanceOf(BusinessException.class)
                .extracting("code").isEqualTo(ResultCode.ADMIN_CANNOT_MODIFY_SELF.getCode());

        verify(adminMapper, never()).updateById(any(Admin.class));
        verify(tokenStore, never()).revokeAllTokens(any());
    }

    @Test
    void resetPassword_throwsModifyRoot() {
        Admin root = admin(1, 1, 1);
        when(adminMapper.selectById(1)).thenReturn(root);

        assertThatThrownBy(() -> service.resetPassword(1, "newpassword", 5))
                .isInstanceOf(BusinessException.class)
                .extracting("code").isEqualTo(ResultCode.ADMIN_CANNOT_MODIFY_ROOT.getCode());
    }

    @Test
    void resetPassword_succeedsAndRevokesTokens() {
        Admin target = admin(5, 0, 1);
        when(adminMapper.selectById(5)).thenReturn(target);
        when(passwordEncoder.encode("newpassword")).thenReturn("NEWHASH");

        service.resetPassword(5, "newpassword", 1);

        verify(adminMapper).updateById(any(Admin.class));
        verify(tokenStore).revokeAllTokens(5);
    }

    // ============ updateStatus ============

    @Test
    void updateStatus_throwsEnableNotSupported() {
        Admin target = admin(5, 0, 0);
        when(adminMapper.selectById(5)).thenReturn(target);

        assertThatThrownBy(() -> service.updateStatus(5, 1, 1))
                .isInstanceOf(BusinessException.class)
                .extracting("code").isEqualTo(ResultCode.ADMIN_ENABLE_NOT_SUPPORTED.getCode());
    }

    @Test
    void updateStatus_throwsSelfProtection() {
        Admin target = admin(5, 0, 1);
        when(adminMapper.selectById(5)).thenReturn(target);

        assertThatThrownBy(() -> service.updateStatus(5, 0, 5))
                .isInstanceOf(BusinessException.class)
                .extracting("code").isEqualTo(ResultCode.ADMIN_CANNOT_MODIFY_SELF.getCode());
    }

    @Test
    void updateStatus_succeedsDeactivatesAndRevokes() {
        Admin target = admin(5, 0, 1);
        when(adminMapper.selectById(5)).thenReturn(target);

        service.updateStatus(5, 0, 1);

        verify(adminMapper).updateById(any(Admin.class));
        verify(tokenStore, times(1)).revokeAllTokens(5);
    }
}
