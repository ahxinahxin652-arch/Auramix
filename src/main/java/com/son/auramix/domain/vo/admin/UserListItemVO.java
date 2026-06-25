package com.son.auramix.domain.vo.admin;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class UserListItemVO {
    private Long id;
    private String email;
    private String displayName;
    private String avatarUrl;
    private String country;
    private Integer product;
    private Integer status;
    private LocalDateTime createdAt;
}
