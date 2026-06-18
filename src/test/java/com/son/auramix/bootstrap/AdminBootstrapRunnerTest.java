package com.son.auramix.bootstrap;

import com.son.auramix.domain.entity.Admin;
import com.son.auramix.mapper.AdminMapper;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AdminBootstrapRunnerTest {

    @Mock private AdminMapper adminMapper;
    @Mock private PasswordEncoder passwordEncoder;

    @Test
    void run_skipsWhenTableNotEmpty() throws Exception {
        when(adminMapper.selectCount()).thenReturn(5L);

        AdminBootstrapRunner runner = new AdminBootstrapRunner(adminMapper, passwordEncoder);
        ReflectionTestUtils.setField(runner, "username", "admin");
        ReflectionTestUtils.setField(runner, "password", "secret-pw");

        runner.run();

        verify(adminMapper, never()).insert(any(Admin.class));
    }

    @Test
    void run_seedsWithProvidedPassword() throws Exception {
        when(adminMapper.selectCount()).thenReturn(0L);
        when(passwordEncoder.encode("secret-pw")).thenReturn("HASH");

        AdminBootstrapRunner runner = new AdminBootstrapRunner(adminMapper, passwordEncoder);
        ReflectionTestUtils.setField(runner, "username", "admin");
        ReflectionTestUtils.setField(runner, "password", "secret-pw");

        runner.run();

        ArgumentCaptor<Admin> cap = ArgumentCaptor.forClass(Admin.class);
        verify(adminMapper).insert(cap.capture());
        Admin inserted = cap.getValue();
        assertThat(inserted.getUsername()).isEqualTo("admin");
        assertThat(inserted.getPassword()).isEqualTo("HASH");
        assertThat(inserted.getIsRoot()).isEqualTo(1);
        assertThat(inserted.getStatus()).isEqualTo(1);
    }

    @Test
    void run_seedsWithRandomPasswordWhenBlank() throws Exception {
        when(adminMapper.selectCount()).thenReturn(0L);
        when(passwordEncoder.encode(anyString())).thenReturn("HASH");

        AdminBootstrapRunner runner = new AdminBootstrapRunner(adminMapper, passwordEncoder);
        ReflectionTestUtils.setField(runner, "username", "admin");
        ReflectionTestUtils.setField(runner, "password", "");

        runner.run();

        ArgumentCaptor<Admin> cap = ArgumentCaptor.forClass(Admin.class);
        verify(adminMapper).insert(cap.capture());
        Admin inserted = cap.getValue();
        // 密码字段被填充为 HASH（明文由 logger 输出，未保留）
        assertThat(inserted.getPassword()).isEqualTo("HASH");
        assertThat(inserted.getIsRoot()).isEqualTo(1);
    }
}
