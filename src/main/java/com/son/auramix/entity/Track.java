package com.son.auramix.entity;

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
 * 单曲 / 曲目表 tracks
 */
@Data
@TableName("tracks")
public class Track implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    @TableId(type = IdType.ASSIGN_ID)
    private Long id;

    private Long albumId;

    private String title;

    /** 时长（毫秒） */
    private Integer duration;

    private String lyricsUrl;

    /** 0=正常 -1=已下架 -2=暂无版权 */
    private Integer status;

    private Integer likedCount;

    private Long playCount;

    private Integer trackNumber;

    private Integer discNumber;

    @TableField(value = "created_at", fill = FieldFill.INSERT)
    private LocalDateTime createdAt;

    @TableField(value = "updated_at", fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updatedAt;
}
