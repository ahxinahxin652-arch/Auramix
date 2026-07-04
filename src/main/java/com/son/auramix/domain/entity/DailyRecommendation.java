package com.son.auramix.domain.entity;

import com.baomidou.mybatisplus.annotation.FieldFill;
import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.io.Serial;
import java.io.Serializable;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * 每日推荐记录表 daily_recommendations
 * <p>
 * 存储每天为用户生成的个性化推荐歌曲及推荐理由
 *
 * @author auramix
 */
@Data
@TableName("daily_recommendations")
public class DailyRecommendation implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    /** 推荐来源: 长期偏好 */
    public static final int SOURCE_LONG_TERM = 0;
    /** 推荐来源: 短期兴趣 */
    public static final int SOURCE_SHORT_TERM = 1;
    /** 推荐来源: 探索推荐 */
    public static final int SOURCE_EXPLORE = 2;

    /** 雪花算法唯一ID */
    @TableId(type = IdType.ASSIGN_ID)
    private Long id;

    /** 用户ID */
    private Long userId;

    /** 推荐单曲ID */
    private Long trackId;

    /** 推荐日期 */
    private LocalDate recommendDate;

    /** 排序位置 (从1开始) */
    @TableField("`rank`")
    private Integer rank;

    /** 推荐理由标签 (如"因为你喜欢周杰伦") */
    private String reasonTag;

    /** 推荐来源: 0=长期偏好, 1=短期兴趣, 2=探索推荐 */
    @TableField("`source`")
    private Integer source;

    /** 记录更新时间 */
    @TableField(value = "updated_at", fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updatedAt;
}
