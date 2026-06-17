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
 * 单曲收藏表 liked_tracks
 * <p>
 * 物理主键为 {@code (user_id, track_id)} 复合键。详见 {@link TrackArtist} 的说明。
 */
@Data
@TableName("liked_tracks")
public class LikedTrack implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    @TableId(type = IdType.INPUT)
    private Long userId;

    @TableField("track_id")
    private Long trackId;

    @TableField(value = "liked_at", fill = FieldFill.INSERT)
    private LocalDateTime likedAt;
}
