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
 * MV 视频资源表 track_video_resources
 */
@Data
@TableName("track_video_resources")
public class TrackVideoResource implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    @TableId(type = IdType.ASSIGN_ID)
    private Long id;

    private Long trackId;

    /** 0=360p 1=720p 2=1080p 3=4K */
    private Integer quality;

    private String resolution;

    private Integer fps;

    /** 0=mp4 1=webm 2=mkv */
    private Integer format;

    private Integer bitrate;

    private String streamUrl;

    private Long size;

    @TableField(value = "created_at", fill = FieldFill.INSERT)
    private LocalDateTime createdAt;
}
