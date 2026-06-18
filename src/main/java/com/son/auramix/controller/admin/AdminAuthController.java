package com.son.auramix.controller.admin;

import com.son.auramix.common.result.Result;
import com.son.auramix.domain.dto.admin.AdminLoginRequest;
import com.son.auramix.domain.dto.admin.AdminLoginResponse;
import com.son.auramix.domain.dto.admin.AdminProfileResponse;
import com.son.auramix.security.admin.AdminUserDetails;
import com.son.auramix.service.admin.AdminAuthService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * 管理员自助鉴权接口：登录 / 登出 / 取自身 profile。
 * 管理员 CRUD 见 {@link AdminManageController}（需 ROOT_ADMIN）。
 */
@RestController
@RequestMapping("/api/admin/auth")
@RequiredArgsConstructor
public class AdminAuthController {

    private final AdminAuthService authService;

    /**
     * POST /api/admin/auth/login — 用户名 + 密码登录，返回 token 与 profile。
     * 失败由全局异常处理返回 ADMIN_BAD_CREDENTIALS / ADMIN_DISABLED。
     */
    @PostMapping("/login")
    public Result<AdminLoginResponse> login(@Valid @RequestBody AdminLoginRequest req,
                                            HttpServletRequest request) {
        String ip = resolveClientIp(request);
        return Result.success(authService.login(req.getUsername(), req.getPassword(), ip));
    }

    /**
     * POST /api/admin/auth/logout — 撤销当前 token。未认证时幂等返回成功。
     */
    @PostMapping("/logout")
    public Result<Void> logout() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !(auth.getPrincipal() instanceof AdminUserDetails p)) {
            return Result.success();
        }
        String token = (String) auth.getCredentials();
        authService.logout(p.getAdminId(), token);
        return Result.success();
    }

    /**
     * GET /api/admin/auth/me — 取当前管理员 profile。
     */
    @GetMapping("/me")
    public Result<AdminProfileResponse> me(@AuthenticationPrincipal AdminUserDetails p) {
        if (p == null) {
            return Result.success();
        }
        return Result.success(authService.getProfile(p.getAdminId()));
    }

    /** 解析客户端 IP：X-Forwarded-For 链首优先，缺失则用 remoteAddr。 */
    private String resolveClientIp(HttpServletRequest request) {
        String xff = request.getHeader("X-Forwarded-For");
        if (xff != null && !xff.isBlank()) {
            return xff.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}
