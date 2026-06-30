package com.son.auramix.domain.dto.admin;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

/**
 * 场景标签创建请求
 *
 * @author auramix
 */
@Data
public class SceneTagCreateDTO {

    @NotBlank(message = "场景名称不能为空")
    private String name;

    private String description;

    private String icon;

    @NotNull(message = "场景类型不能为空")
    private Integer sceneType;

    @NotBlank(message = "触发条件不能为空")
    private String conditionsJson;

    private Integer timezoneOffset;

    private Integer priority;

    private Integer displayOrder;

    private Integer status;
}
