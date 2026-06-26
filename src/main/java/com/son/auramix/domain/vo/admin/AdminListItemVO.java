package com.son.auramix.domain.vo.admin;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class AdminListItemVO {
    private Integer id;
    private String username;
    private String email;
    private Integer isRoot;
    private Integer status;
    private LocalDateTime lastLoginTime;
    private LocalDateTime createdAt;
}
