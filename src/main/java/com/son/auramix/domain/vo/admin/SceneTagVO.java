package com.son.auramix.domain.vo.admin;

import lombok.Data;

import java.time.LocalDateTime;

/**
 * 场景标签视图对象
 *
 * @author auramix
 */
@Data
public class SceneTagVO {

    private Long id;

    private String name;

    private String description;

    private String icon;

    private Integer sceneType;

    private String conditionsJson;

    private Integer timezoneOffset;

    private Integer priority;

    private Integer displayOrder;

    private Integer status;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}
