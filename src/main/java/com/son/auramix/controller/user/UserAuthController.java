package com.son.auramix.controller.user;

import com.son.auramix.common.exception.BusinessException;
import com.son.auramix.common.result.Result;
import com.son.auramix.common.result.ResultCode;
import com.son.auramix.domain.dto.user.SendCodeRequest;
import com.son.auramix.domain.dto.user.UserLoginRequest;
import com.son.auramix.domain.dto.user.UserLoginResponse;
import com.son.auramix.domain.dto.user.UserRegisterRequest;
import com.son.auramix.domain.dto.user.UserProfileResponse;
import com.son.auramix.service.user.EmailService;
import com.son.auramix.service.user.UserAuthService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

/**
 * 用户认证接口
 */
@RestController
@RequestMapping("/api/user/auth")
@RequiredArgsConstructor
public class UserAuthController {

    private final UserAuthService userAuthService;
    private final EmailService emailService;

    // ============================ 发送验证码 ============================

    @PostMapping("/send-code")
    public Result<Void> sendCode(@Valid @RequestBody SendCodeRequest request) {
        userAuthService.sendVerificationCode(request.getEmail(), emailService);
        return Result.success(null, "验证码已发送");
    }

    // ============================ 注册 ============================

    @PostMapping("/register")
    public Result<UserLoginResponse> register(@Valid @RequestBody UserRegisterRequest request,
                                               HttpServletRequest httpRequest) {
        UserLoginResponse resp = userAuthService.register(
                request.getEmail(),
                request.getPassword(),
                request.getDisplayName(),
                request.getCode(),
                getClientIp(httpRequest)
        );
        return Result.success(resp, "注册成功");
    }

    // ============================ 登录 ============================

    @PostMapping("/login")
    public Result<UserLoginResponse> login(@Valid @RequestBody UserLoginRequest request,
                                            HttpServletRequest httpRequest) {
        UserLoginResponse resp = userAuthService.login(
                request.getEmail(),
                request.getPassword(),
                getClientIp(httpRequest)
        );
        return Result.success(resp, "登录成功");
    }

    // ============================ 登出 ============================

    @PostMapping("/logout")
    public Result<Void> logout(HttpServletRequest request) {
        String token = extractToken(request);
        if (token == null) {
            throw new BusinessException(ResultCode.USER_TOKEN_INVALID);
        }
        var session = userAuthService.loadSession(token);
        if (session == null) {
            throw new BusinessException(ResultCode.USER_TOKEN_INVALID);
        }
        userAuthService.logout(session.getId(), token);
        return Result.success(null, "已登出");
    }

    // ============================ 当前用户信息 ============================

    @GetMapping("/me")
    public Result<UserProfileResponse> me(HttpServletRequest request) {
        String token = extractToken(request);
        if (token == null) {
            throw new BusinessException(ResultCode.USER_TOKEN_INVALID);
        }
        var session = userAuthService.loadSession(token);
        if (session == null) {
            throw new BusinessException(ResultCode.USER_TOKEN_INVALID);
        }
        UserProfileResponse profile = userAuthService.getProfile(session.getId());
        return Result.success(profile);
    }

    // ============================ 辅助 ============================

    private String getClientIp(HttpServletRequest request) {
        String xff = request.getHeader("X-Forwarded-For");
        return xff != null ? xff.split(",")[0].trim() : request.getRemoteAddr();
    }

    private String extractToken(HttpServletRequest request) {
        String header = request.getHeader("Authorization");
        if (header == null || !header.startsWith("Bearer ")) {
            return null;
        }
        String token = header.substring(7).trim();
        return token.isEmpty() ? null : token;
    }
}
