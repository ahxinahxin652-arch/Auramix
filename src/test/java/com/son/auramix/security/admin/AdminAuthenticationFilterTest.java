package com.son.auramix.security.admin;

import com.son.auramix.service.admin.AdminSessionInfo;
import com.son.auramix.service.admin.AdminTokenStore;
import jakarta.servlet.FilterChain;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.concurrent.atomic.AtomicReference;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doAnswer;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AdminAuthenticationFilterTest {

    @Mock private AdminTokenStore tokenStore;
    @Mock private FilterChain chain;

    private AdminAuthenticationFilter filter;

    @BeforeEach
    void setUp() {
        filter = new AdminAuthenticationFilter(tokenStore);
        SecurityContextHolder.clearContext();
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void doesNotSetContextWhenHeaderMissing() throws Exception {
        MockHttpServletRequest req = new MockHttpServletRequest();
        MockHttpServletResponse resp = new MockHttpServletResponse();

        filter.doFilter(req, resp, chain);

        verify(chain).doFilter(req, resp);
        assertThat(SecurityContextHolder.getContext().getAuthentication()).isNull();
        verify(tokenStore, never()).loadToken(any());
    }

    @Test
    void doesNotSetContextWhenTokenInvalid() throws Exception {
        MockHttpServletRequest req = new MockHttpServletRequest();
        req.addHeader("Authorization", "Bearer bad-token");
        MockHttpServletResponse resp = new MockHttpServletResponse();

        when(tokenStore.loadToken("bad-token")).thenReturn(null);

        filter.doFilter(req, resp, chain);

        assertThat(SecurityContextHolder.getContext().getAuthentication()).isNull();
    }

    @Test
    void setsContextWhenTokenValid() throws Exception {
        MockHttpServletRequest req = new MockHttpServletRequest();
        req.addHeader("Authorization", "Bearer good-token");
        MockHttpServletResponse resp = new MockHttpServletResponse();

        AdminSessionInfo info = AdminSessionInfo.builder()
                .id(7).username("bob").isRoot(1).build();
        when(tokenStore.loadToken("good-token")).thenReturn(info);

        // 过滤器在 finally 中会清空 context，断言要在 chain 执行时进行
        AtomicReference<Authentication> captured = new AtomicReference<>();
        doAnswer(inv -> {
            captured.set(SecurityContextHolder.getContext().getAuthentication());
            return null;
        }).when(chain).doFilter(any(HttpServletRequest.class), any(HttpServletResponse.class));

        filter.doFilter(req, resp, chain);

        Authentication auth = captured.get();
        assertThat(auth).isNotNull();
        assertThat(((AdminUserDetails) auth.getPrincipal()).getAdminId()).isEqualTo(7);
        assertThat(auth.getAuthorities())
                .extracting("authority").containsExactly("ROOT_ADMIN");
        assertThat(auth.getCredentials()).isEqualTo("good-token");
    }
}
