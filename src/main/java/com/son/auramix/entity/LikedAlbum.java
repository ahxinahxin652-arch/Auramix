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
 * 专辑收藏表 liked_albums
 * <p>
 * 物理主键为 {@code (album_id, user_id)} 复合键。详见 {@link TrackArtist} 的说明。
 */
@Data
@TableName("liked_albums")
public class LikedAlbum implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    @TableId(type = IdType.INPUT)
    private Long albumId;

    @TableField("user_id")
    private Long userId;

    @TableField(value = "liked_at", fill = FieldFill.INSERT)
    private LocalDateTime likedAt;
}
