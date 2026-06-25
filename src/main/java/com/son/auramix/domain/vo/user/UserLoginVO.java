package com.son.auramix.domain.vo.user;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 用户登录响应
 */
@Data
@Builder
public class UserLoginVO {
    private String token;
    private LocalDateTime expiresAt;
    private UserProfileVO profile;
}
