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
 * 播放历史记录表 playback_history
 */
@Data
@TableName("playback_history")
public class PlaybackHistory implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    @TableId(type = IdType.ASSIGN_ID)
    private Long id;

    private Long userId;

    private Long trackId;

    @TableField(value = "played_at", fill = FieldFill.INSERT)
    private LocalDateTime playedAt;

    /** 0=歌单 1=专辑 2=歌手页 */
    private Integer contextType;

    private Long contextId;
}
