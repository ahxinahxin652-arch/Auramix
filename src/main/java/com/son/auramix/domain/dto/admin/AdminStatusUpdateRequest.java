package com.son.auramix.domain.dto.admin;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class AdminStatusUpdateRequest {

    @NotNull(message = "status 不能为空")
    private Integer status;
}
