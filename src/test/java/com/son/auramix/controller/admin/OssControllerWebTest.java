package com.son.auramix.controller.admin;

import com.son.auramix.common.result.ResultCode;
import com.son.auramix.domain.vo.admin.OssPolicyVO;
import com.son.auramix.security.admin.AdminUserDetails;
import com.son.auramix.service.admin.AdminTokenStore;
import com.son.auramix.service.user.UserTokenStore;
import com.son.auramix.service.oss.OssService;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = OssController.class)
@AutoConfigureMockMvc(addFilters = false)
class OssControllerWebTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private OssService ossService;

    @MockBean
    private AdminTokenStore adminTokenStore;

    @MockBean
    private UserTokenStore userTokenStore;

    @BeforeEach
    void setUp() {
        AdminUserDetails principal = new AdminUserDetails(
                1, "admin", null, 1,
                List.of(new SimpleGrantedAuthority("ROOT_ADMIN")));
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(principal, null, principal.getAuthorities()));
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void getPostPolicy_returns200OnWhitelistedType() throws Exception {
        OssPolicyVO resp = new OssPolicyVO();
        when(ossService.generatePostPolicy(anyString())).thenReturn(resp);

        mockMvc.perform(get("/api/admin/manage/oss/policy")
                        .param("type", "audio"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200));
    }

    @Test
    void getPostPolicy_throws400OnNonWhitelistedType() throws Exception {
        mockMvc.perform(get("/api/admin/manage/oss/policy")
                        .param("type", "invalid"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(ResultCode.BAD_REQUEST.getCode()));
    }
}
