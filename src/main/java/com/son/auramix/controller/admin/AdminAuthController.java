package com.son.auramix.controller.admin;

import com.son.auramix.common.result.Result;
import com.son.auramix.dto.admin.AdminLoginRequest;
import com.son.auramix.dto.admin.AdminLoginResponse;
import com.son.auramix.dto.admin.AdminProfileResponse;
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

@RestController
@RequestMapping("/api/admin/auth")
@RequiredArgsConstructor
public class AdminAuthController {

    private final AdminAuthService authService;

    @PostMapping("/login")
    public Result<AdminLoginResponse> login(@Valid @RequestBody AdminLoginRequest req,
                                            HttpServletRequest request) {
        String ip = resolveClientIp(request);
        return Result.success(authService.login(req.getUsername(), req.getPassword(), ip));
    }

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

    @GetMapping("/me")
    public Result<AdminProfileResponse> me(@AuthenticationPrincipal AdminUserDetails p) {
        if (p == null) {
            return Result.success();
        }
        return Result.success(authService.getProfile(p.getAdminId()));
    }

    private String resolveClientIp(HttpServletRequest request) {
        String xff = request.getHeader("X-Forwarded-For");
        if (xff != null && !xff.isBlank()) {
            return xff.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}
