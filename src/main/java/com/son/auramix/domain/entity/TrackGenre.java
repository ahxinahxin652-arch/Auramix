package com.son.auramix.domain.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.io.Serial;
import java.io.Serializable;

/**
 * 歌曲 - 流派关联表 track_genres
 * <p>
 * 物理主键为 {@code (track_id, genre_id)} 复合键。详见 {@link TrackArtist} 的说明。
 */
@Data
@TableName("track_genres")
public class TrackGenre implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    @TableId(type = IdType.INPUT)
    private Long trackId;

    @TableField("genre_id")
    private Long genreId;
}
