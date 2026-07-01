package com.son.auramix.domain.entity;

import com.baomidou.mybatisplus.annotation.FieldFill;
import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.io.Serial;
import java.io.Serializable;
import java.time.LocalDateTime;

/**
 * 场景标签实体
 *
 * @author auramix
 */
@Data
@TableName("scene_tags")
public class SceneTag implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    /** 场景类型: 时间型 */
    public static final int SCENE_TYPE_TIME = 0;
    /** 场景类型: 活动型 */
    public static final int SCENE_TYPE_ACTIVITY = 1;
    /** 场景类型: 天气型 */
    public static final int SCENE_TYPE_WEATHER = 2;

    /** 状态: 禁用 */
    public static final int STATUS_DISABLED = 0;
    /** 状态: 启用 */
    public static final int STATUS_ENABLED = 1;

    /**
     * 雪花算法唯一ID
     */
    @TableId(value = "id", type = IdType.ASSIGN_ID)
    private Long id;

    /**
     * 场景名称 (如"工作专注")
     */
    @TableField("name")
    private String name;

    /**
     * 场景描述（给运营看）
     */
    @TableField("description")
    private String description;

    /**
     * 场景图标URL/名称
     */
    @TableField("icon")
    private String icon;

    /**
     * 场景类型: 0=时间型, 1=活动型, 2=天气型
     */
    @TableField("scene_type")
    private Integer sceneType;

    /**
     * 触发条件JSON
     */
    @TableField("conditions_json")
    private String conditionsJson;

    /**
     * 时区偏移（小时），默认东八区
     */
    @TableField("timezone_offset")
    private Integer timezoneOffset;

    /**
     * 优先级（数字越大越优先）
     */
    @TableField("priority")
    private Integer priority;

    /**
     * 前端展示排序（升序）
     */
    @TableField("display_order")
    private Integer displayOrder;

    /**
     * 状态: 0=禁用, 1=启用
     */
    @TableField("status")
    private Integer status;

    /**
     * 创建时间
     */
    @TableField(value = "created_at", fill = FieldFill.INSERT)
    private LocalDateTime createdAt;

    /**
     * 更新时间
     */
    @TableField(value = "updated_at", fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updatedAt;
}
