package com.son.auramix.dto.admin;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class AdminLoginResponse {
    private String token;
    private LocalDateTime expiresAt;
    private AdminProfileResponse profile;
}
