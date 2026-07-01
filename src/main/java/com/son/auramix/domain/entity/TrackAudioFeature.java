package com.son.auramix.domain.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@TableName("track_audio_features")
public class TrackAudioFeature {

    @TableId(value = "track_id", type = IdType.INPUT)
    private Long trackId;

    /** 速度 BPM */
    private BigDecimal tempo;

    /** 调性 0=C ~ 11=B */
    private Integer musicalKey;

    /** 调式 0=大调, 1=小调 */
    private Integer musicalMode;

    /** 拍号 */
    private Integer timeSignature;

    /** 愉悦度 0.000~1.000 */
    private BigDecimal valence;

    /** 唤醒度 0.000~1.000 */
    private BigDecimal arousal;

    /** 能量值 0.000~1.000 */
    private BigDecimal energy;

    /** 舞曲感 0.000~1.000 */
    private BigDecimal danceability;

    /** 原声程度 0.000~1.000 */
    private BigDecimal acousticness;

    /** 纯器乐程度 0.000~1.000 */
    private BigDecimal instrumentalness;

    /** MFCC 向量 JSON */
    @TableField("mfcc_vector")
    private String mfccVector;

    /** 向量数据库 embedding ID */
    private String audioVectorId;

    /** 特征版本 */
    private Integer version;

    /** 更新时间 */
    private LocalDateTime updatedAt;
}
