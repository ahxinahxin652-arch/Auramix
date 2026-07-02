package com.son.auramix.domain.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * Agent 智能对话 - 用户画像实体
 */
@Data
@TableName("user_profiles")
public class UserProfile {

    /**
     * 用户ID主键
     */
    @TableId(type = IdType.INPUT)
    private Long userId;

    /**
     * 喜欢的流派(逗号分隔)
     */
    private String favoriteGenres;

    /**
     * 喜欢的歌手(逗号分隔)
     */
    private String favoriteArtists;

    /**
     * Agent维护的用户偏好详细总结
     */
    private String summary;

    /**
     * 创建时间
     */
    private LocalDateTime createdAt;

    /**
     * 更新时间
     */
    private LocalDateTime updatedAt;
}
