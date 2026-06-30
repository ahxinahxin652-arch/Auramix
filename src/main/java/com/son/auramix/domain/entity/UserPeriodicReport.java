package com.son.auramix.domain.entity;

import com.baomidou.mybatisplus.annotation.FieldFill;
import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.io.Serial;
import java.io.Serializable;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * 用户周期总结报告主表 user_periodic_reports
 */
@Data
@TableName("user_periodic_reports")
public class UserPeriodicReport implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    @TableId(type = IdType.ASSIGN_ID)
    private Long id;

    private Long userId;

    /** 1=周报 2=月报 */
    private Integer periodType;

    private LocalDate periodStart;

    private LocalDate periodEnd;

    /** 统计快照 JSON 字符串（冗余存储） */
    private String statsSnapshot;

    private String llmSummary;

    /** 心情标签, 逗号分隔 */
    private String moodTags;

    /** 重点时刻 JSON 字符串 */
    private String highlights;

    /** 推荐收听 JSON 字符串 */
    private String recommendations;

    /** 0=生成中 1=已生成 2=失败 3=无数据 */
    private Integer status;

    private String errorMessage;

    private LocalDateTime generatedAt;

    @TableField(value = "created_at", fill = FieldFill.INSERT)
    private LocalDateTime createdAt;

    @TableField(value = "updated_at", fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updatedAt;
}