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
 * 用户行为日志表 user_behavior_logs
 * <p>
 * 实时记录用户操作行为，用于推荐模型训练和短期兴趣捕捉
 */
@Data
@TableName("user_behavior_logs")
public class UserBehaviorLog implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    /** 行为类型常量 */
    public static final int BEHAVIOR_PLAY = 0;
    public static final int BEHAVIOR_FAVORITE = 1;
    public static final int BEHAVIOR_UNFAVORITE = 2;
    public static final int BEHAVIOR_SKIP = 3;
    public static final int BEHAVIOR_FULL_LISTEN = 4;
    public static final int BEHAVIOR_SEARCH = 5;
    public static final int BEHAVIOR_SHARE = 6;
    public static final int BEHAVIOR_ADD_TO_PLAYLIST = 7;

    @TableId(type = IdType.ASSIGN_ID)
    private Long id;

    /** 用户ID */
    private Long userId;

    /** 关联单曲ID（可为null，如搜索行为无具体歌曲） */
    private Long trackId;

    /** 行为类型: 0=播放, 1=收藏, 2=取消收藏, 3=跳过, 4=完整听完, 5=搜索, 6=分享, 7=添加到歌单 */
    private Integer behaviorType;

    /** 行为上下文（如来源页面: home/recommend/discover/playlist/search） */
    private String context;

    /** 行为持续时长(秒)，如收听时长 */
    private Integer behaviorDuration;

    @TableField(value = "created_at", fill = FieldFill.INSERT)
    private LocalDateTime createdAt;
}
