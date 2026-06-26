package com.son.auramix.controller.admin;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.son.auramix.common.exception.BusinessException;
import com.son.auramix.common.result.ResultCode;
import com.son.auramix.domain.dto.admin.AdminCreateDTO;
import com.son.auramix.domain.dto.admin.AdminPasswordResetDTO;
import com.son.auramix.domain.vo.admin.AdminProfileVO;
import com.son.auramix.security.admin.AdminUserDetails;
import com.son.auramix.service.admin.AdminManageService;
import com.son.auramix.service.admin.AdminTokenStore;
import com.son.auramix.service.user.UserTokenStore;
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

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = AdminManageController.class)
@AutoConfigureMockMvc(addFilters = false)
class AdminManageControllerWebTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private AdminManageService manageService;

    /** AdminAuthenticationFilter 和 UserAuthenticationFilter 是 @Component，需要 TokenStore Mock */
    @MockBean
    private AdminTokenStore adminTokenStore;

    @MockBean
    private UserTokenStore userTokenStore;

    @Autowired
    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        // 控制器使用 @AuthenticationPrincipal AdminUserDetails current
        // @WithMockUser 的 principal 是 User 类型，不匹配，所以手动注入 AdminUserDetails
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
    void create_returns200() throws Exception {
        AdminCreateDTO req = new AdminCreateDTO();
        req.setUsername("alice");
        req.setPassword("password123");
        req.setEmail("a@x.com");

        AdminProfileVO resp = AdminProfileVO.builder().id(2).username("alice").isRoot(0).status(1).build();
        when(manageService.createAdmin(any())).thenReturn(resp);

        mockMvc.perform(post("/api/admin/manage/admins")
                        .contentType("application/json")
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.id").value(2));
    }

    @Test
    void create_returns400OnBlankFields() throws Exception {
        AdminCreateDTO req = new AdminCreateDTO();
        // 全空

        mockMvc.perform(post("/api/admin/manage/admins")
                        .contentType("application/json")
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(400));
    }

    @Test
    void resetPassword_throwsCannotModifySelf() throws Exception {
        AdminPasswordResetDTO req = new AdminPasswordResetDTO();
        req.setNewPassword("newpassword");

        doThrow(new BusinessException(ResultCode.ADMIN_CANNOT_MODIFY_SELF))
                .when(manageService).resetPassword(anyInt(), anyString(), anyInt());

        mockMvc.perform(put("/api/admin/manage/admins/5/password")
                        .contentType("application/json")
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(ResultCode.ADMIN_CANNOT_MODIFY_SELF.getCode()));
    }
}
