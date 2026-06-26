package com.son.auramix.domain.dto.admin;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

/**
 * 管理员人工确认审核结果
 */
@Data
public class ReviewConfirmDTO {

    /** 1=通过, -1=不通过 */
    @NotNull
    private Integer adminVerdict;

    private String adminNote;
}
