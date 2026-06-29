package com.son.auramix.domain.dto.user;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

/**
 * 用户行为日志新增请求
 */
@Data
public class UserBehaviorLogCreateDTO {

    @NotBlank(message = "操作类型不能为空")
    private String actionType;

    @NotNull(message = "目标类型不能为空")
    private Integer targetType;

    @NotNull(message = "目标 ID 不能为空")
    private Long targetId;

    /** 附加信息 JSON，可选 */
    private String metadata;
}
