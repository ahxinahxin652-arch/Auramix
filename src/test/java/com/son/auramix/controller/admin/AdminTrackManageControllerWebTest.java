package com.son.auramix.controller.admin;

import com.son.auramix.common.result.ResultCode;
import com.son.auramix.domain.dto.admin.TrackDetailResponse;
import com.son.auramix.security.admin.AdminUserDetails;
import com.son.auramix.service.admin.AdminTokenStore;
import com.son.auramix.service.user.UserTokenStore;
import com.son.auramix.service.admin.TrackService;
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

import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = AdminTrackManageController.class)
@AutoConfigureMockMvc(addFilters = false)
class AdminTrackManageControllerWebTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private TrackService trackService;

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
    void get_returns200OnExistingTrack() throws Exception {
        TrackDetailResponse detail = new TrackDetailResponse();
        when(trackService.getTrackDetail(anyLong())).thenReturn(detail);

        mockMvc.perform(get("/api/admin/manage/tracks/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200));
    }

    @Test
    void get_throws404OnMissingTrack() throws Exception {
        when(trackService.getTrackDetail(anyLong())).thenReturn(null);

        mockMvc.perform(get("/api/admin/manage/tracks/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(ResultCode.NOT_FOUND.getCode()));
    }
}
