package com.son.auramix.dto.admin;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class AdminListItemResponse {
    private Integer id;
    private String username;
    private String email;
    private Integer isRoot;
    private Integer status;
    private LocalDateTime lastLoginTime;
    private LocalDateTime createdAt;
}
