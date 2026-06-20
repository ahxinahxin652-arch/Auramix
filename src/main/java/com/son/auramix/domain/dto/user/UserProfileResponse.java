package com.son.auramix.domain.dto.user;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 用户信息响应
 */
@Data
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class UserProfileResponse {
    private Long id;
    private String email;
    private String displayName;
    private String avatarUrl;
    private String country;
    private Integer product;
    private LocalDateTime createdAt;
}
