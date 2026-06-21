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
 * 歌单关注表 playlist_followers
 * <p>
 * 物理主键为 {@code (playlist_id, user_id)} 复合键。详见 {@link TrackArtist} 的说明。
 */
@Data
@TableName("playlist_followers")
public class PlaylistFollower implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    @TableId(type = IdType.INPUT)
    private Long playlistId;

    @TableField("user_id")
    private Long userId;

    @TableField(value = "followed_at", fill = FieldFill.INSERT)
    private LocalDateTime followedAt;
}
