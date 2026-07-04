package com.son.auramix.domain.entity;

import com.baomidou.mybatisplus.annotation.FieldFill;
import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.io.Serial;
import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 用户偏好向量表 user_preference_vectors
 * <p>
 * 存储用户长期/短期偏好模型结果，用于快速推荐
 *
 * @author auramix
 */
@Data
@TableName("user_preference_vectors")
public class UserPreferenceVector implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    // ====== 基础标识 ======

    /** 用户ID（主键，由外部传入） */
    @TableId(type = IdType.INPUT)
    private Long userId;

    // ====== 行为统计（冷启动与置信度） ======

    /** 历史总播放次数 */
    private Integer totalPlayCount;

    /** 近30天活跃天数 */
    private Integer activeDays;

    /** 画像置信度 (0~1, 基于行为量计算) */
    private BigDecimal confidenceScore;

    /** 长期画像融合权重 (0~1, 剩余为短期权重) */
    private BigDecimal fusionRatio;

    // ====== 正向偏好 — 长期画像（稳定品味） ======

    /** 长期流派偏好 JSON */
    private String longTermGenre;

    /** 长期艺人偏好 JSON */
    private String longTermArtist;

    /** 长期情绪标签偏好 JSON */
    private String longTermEmotion;

    /** 长期场景标签偏好 JSON */
    private String longTermScene;

    /** 长期画像计算时间 */
    private LocalDateTime longTermUpdatedAt;

    // ====== 正向偏好 — 短期画像（近期兴趣） ======

    /** 短期流派偏好 JSON */
    private String shortTermGenre;

    /** 短期艺人偏好 JSON */
    private String shortTermArtist;

    /** 短期情绪标签偏好 JSON */
    private String shortTermEmotion;

    /** 短期场景标签偏好 JSON */
    private String shortTermScene;

    /** 短期画像计算时间 */
    private LocalDateTime shortTermUpdatedAt;

    // ====== 负向偏好（避雷针） ======

    /** 不喜欢的流派 JSON (权重为负) */
    private String negativeGenre;

    /** 不喜欢的艺人 JSON (权重为负) */
    private String negativeArtist;

    /** 负向画像计算时间 */
    private LocalDateTime negativeUpdatedAt;

    // ====== 版本与元数据 ======

    /** 画像算法版本 (1=V1, 2=V2) */
    private Integer profileVersion;

    /** 本次画像计算时间戳 */
    @TableField(value = "calculated_at", fill = FieldFill.INSERT)
    private LocalDateTime calculatedAt;

    /** 计算依据快照 JSON (如: 最近30天统计) */
    private String dataSnapshot;

    /** 记录最后更新时间 */
    @TableField(value = "updated_at", fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updatedAt;
}
