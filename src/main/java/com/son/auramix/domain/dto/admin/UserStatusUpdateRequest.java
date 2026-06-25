package com.son.auramix.domain.dto.admin;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class UserStatusUpdateRequest {

    @NotNull(message = "状态值不能为空")
    private Integer status;
}
