package com.son.auramix.controller.admin;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.son.auramix.common.exception.BusinessException;
import com.son.auramix.common.result.ResultCode;
import com.son.auramix.domain.dto.admin.AdminLoginRequest;
import com.son.auramix.domain.dto.admin.AdminLoginResponse;
import com.son.auramix.domain.dto.admin.AdminProfileResponse;
import com.son.auramix.service.admin.AdminAuthService;
import com.son.auramix.service.admin.AdminTokenStore;
import com.son.auramix.service.user.UserTokenStore;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;

import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = AdminAuthController.class)
@AutoConfigureMockMvc(addFilters = false)
class AdminAuthControllerWebTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private AdminAuthService authService;

    /**
     * AdminAuthenticationFilter 和 UserAuthenticationFilter 是 @Component，@WebMvcTest 会尝试加载它们，
     * 需要提供 TokenStore Mock 以满足构造器注入。
     */
    @MockBean
    private AdminTokenStore adminTokenStore;

    @MockBean
    private UserTokenStore userTokenStore;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void login_returns200OnSuccess() throws Exception {
        AdminLoginRequest req = new AdminLoginRequest();
        req.setUsername("admin");
        req.setPassword("password123");

        AdminLoginResponse resp = AdminLoginResponse.builder()
                .token("tok-xyz")
                .expiresAt(LocalDateTime.now().plusHours(2))
                .profile(AdminProfileResponse.builder().id(1).username("admin").isRoot(1).status(1).build())
                .build();
        when(authService.login(eq("admin"), eq("password123"), anyString())).thenReturn(resp);

        mockMvc.perform(post("/api/admin/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data.token").value("tok-xyz"));
    }

    @Test
    void login_returns400OnBlankUsername() throws Exception {
        AdminLoginRequest req = new AdminLoginRequest();
        req.setUsername("");
        req.setPassword("password123");

        mockMvc.perform(post("/api/admin/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(400));
    }

    @Test
    void login_returnsBusinessErrorWhenBadCredentials() throws Exception {
        AdminLoginRequest req = new AdminLoginRequest();
        req.setUsername("admin");
        req.setPassword("wrong");

        when(authService.login(eq("admin"), eq("wrong"), anyString()))
                .thenThrow(new BusinessException(ResultCode.ADMIN_BAD_CREDENTIALS));

        mockMvc.perform(post("/api/admin/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(ResultCode.ADMIN_BAD_CREDENTIALS.getCode()));
    }
}
