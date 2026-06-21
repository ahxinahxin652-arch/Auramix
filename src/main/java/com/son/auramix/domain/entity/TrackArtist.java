package com.son.auramix.domain.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.io.Serial;
import java.io.Serializable;

/**
 * 歌曲 - 歌手关联表 track_artists
 * <p>
 * 物理主键为 {@code (track_id, artist_id)} 复合键。MyBatis-Plus 要求单字段 ID，
 * 此处将 {@code trackId} 标记为 {@link IdType#INPUT} 作为 MP 的“代理主键”，
 * 业务写入时必须显式赋值，且仅作为 MP 自身的 ID 语义。
 */
@Data
@TableName("track_artists")
public class TrackArtist implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    @TableId(type = IdType.INPUT)
    private Long trackId;

    @TableField("artist_id")
    private Long artistId;

    /** 0=Main 1=Featuring 2=Composer */
    private Integer role;
}
