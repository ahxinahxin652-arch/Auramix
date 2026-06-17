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
 * 歌单 - 歌曲关联表 playlist_tracks
 * <p>
 * 物理主键为 {@code (playlist_id, track_id)} 复合键。详见 {@link TrackArtist} 的说明。
 */
@Data
@TableName("playlist_tracks")
public class PlaylistTrack implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    @TableId(type = IdType.INPUT)
    private Long playlistId;

    @TableField("track_id")
    private Long trackId;

    private Integer sortOrder;

    @TableField(value = "added_at", fill = FieldFill.INSERT)
    private LocalDateTime addedAt;
}
