package com.son.auramix.domain.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.io.Serial;
import java.io.Serializable;
import java.time.LocalDateTime;

/**
 * 歌曲AI审核记录表 track_review_records
 */
@Data
@TableName("track_review_records")
public class TrackReviewRecord implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    @TableId(type = IdType.ASSIGN_ID)
    private Long id;

    private Long trackId;

    private String trackTitle;

    private String artistNames;

    private String albumTitle;

    private String lyricsContent;

    /** 裁决: 0=待审核, 1=通过, -1=不通过, -2=待人工确认 */
    private Integer verdict;

    /** 最终置信度 0-100 */
    private Integer confidence;

    private String failReasons;

    /** 4+1 个 agent 的完整 JSON 输出 */
    private String agentResults;

    /** 处理状态: 0=AI审核中, 1=AI审核完成待自动处理, 2=已自动处理, 3=待人工确认, 4=人工已确认 */
    private Integer status;

    private Long adminId;

    /** 管理员裁决: 1=通过, -1=不通过 */
    private Integer adminVerdict;

    private String adminNote;

    private LocalDateTime reviewedAt;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}
