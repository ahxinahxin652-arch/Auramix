package com.son.auramix.domain.vo.admin;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class AdminLoginVO {
    private String token;
    private LocalDateTime expiresAt;
    private AdminProfileVO profile;
}
