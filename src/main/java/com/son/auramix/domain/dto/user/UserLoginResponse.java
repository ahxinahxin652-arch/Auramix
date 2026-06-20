package com.son.auramix.domain.dto.user;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 用户登录响应
 */
@Data
@Builder
public class UserLoginResponse {
    private String token;
    private LocalDateTime expiresAt;
    private UserProfileResponse profile;
}
