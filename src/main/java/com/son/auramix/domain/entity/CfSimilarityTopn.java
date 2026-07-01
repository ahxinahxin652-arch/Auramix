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
 * 协同过滤相似度 TopN 表
 * <p>
 * 物理主键为 {@code (source_track_id, target_track_id)} 复合键。
 * 存储基于协同过滤算法计算的歌曲间相似度排名。
 */
@Data
@TableName("cf_similarity_topn")
public class CfSimilarityTopn implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    /** 源歌曲ID（复合主键之一） */
    @TableId(type = IdType.INPUT)
    private Long sourceTrackId;

    /** 目标歌曲ID（复合主键之一） */
    @TableField("target_track_id")
    private Long targetTrackId;

    /** 协同过滤相似度分数 */
    @TableField("sim_cf")
    private Double simCf;

    /** 排名（Java 字段取名 similarityRank 避免与 MySQL 保留字冲突） */
    @TableField("`rank`")
    private Integer similarityRank;

    /** 创建时间 */
    @TableField(value = "created_at", fill = FieldFill.INSERT)
    private LocalDateTime createdAt;

    /** 更新时间 */
    @TableField(value = "updated_at", fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updatedAt;
}
