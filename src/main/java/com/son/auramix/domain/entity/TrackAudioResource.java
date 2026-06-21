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
 * 音源资源表 track_audio_resources
 */
@Data
@TableName("track_audio_resources")
public class TrackAudioResource implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    @TableId(type = IdType.ASSIGN_ID)
    private Long id;

    private Long trackId;

    /** 0=low 1=medium/high 2=lossless */
    private Integer quality;

    /** 0=mp3 1=flac 2=m4a 3=ogg */
    private Integer format;

    private Integer bitrate;

    private String streamUrl;

    private Long size;

    @TableField(value = "created_at", fill = FieldFill.INSERT)
    private LocalDateTime createdAt;
}
