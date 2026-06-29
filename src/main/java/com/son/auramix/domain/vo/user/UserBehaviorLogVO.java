package com.son.auramix.domain.vo.user;

import lombok.Data;

import java.time.LocalDateTime;

/**
 * 用户行为日志响应
 */
@Data
public class UserBehaviorLogVO {

    private Long id;
    private Long userId;
    private String actionType;
    private Integer targetType;
    private Long targetId;
    private String metadata;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
