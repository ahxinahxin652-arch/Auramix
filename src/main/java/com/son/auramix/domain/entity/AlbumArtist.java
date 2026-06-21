package com.son.auramix.domain.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.io.Serial;
import java.io.Serializable;

/**
 * 专辑 - 歌手关联表 album_artists
 * <p>
 * 物理主键为 {@code (album_id, artist_id)} 复合键。详见 {@link TrackArtist} 的说明。
 */
@Data
@TableName("album_artists")
public class AlbumArtist implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    @TableId(type = IdType.INPUT)
    private Long albumId;

    @TableField("artist_id")
    private Long artistId;
}
