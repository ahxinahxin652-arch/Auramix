package com.son.auramix.domain.dto.user;

import lombok.Data;

/**
 * 用户行为日志修改请求（所有字段可选，只更新传了的字段）
 */
@Data
public class UserBehaviorLogUpdateDTO {

    private String actionType;

    private Integer targetType;

    private Long targetId;

    private String metadata;
}
