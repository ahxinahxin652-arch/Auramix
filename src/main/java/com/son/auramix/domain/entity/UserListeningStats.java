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
 * 用户周期听歌统计缓存表 user_listening_stats
 */
@Data
@TableName("user_listening_stats")
public class UserListeningStats implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    @TableId(type = IdType.ASSIGN_ID)
    private Long id;

    private Long userId;

    /** 1=周报 2=月报 */
    private Integer periodType;

    private LocalDate periodStart;

    private LocalDate periodEnd;

    private Integer totalPlays;

    private Long totalDurationSec;

    private Integer uniqueTracks;

    /** TOP 歌曲 JSON 字符串 */
    private String topTracks;

    /** TOP 歌手 JSON 字符串 */
    private String topArtists;

    /** TOP 流派 JSON 字符串 */
    private String topGenres;

    /** TOP 专辑 JSON 字符串 */
    private String topAlbums;

    /** 24 长度数组 JSON 字符串 */
    private String hourlyDistribution;

    /** 7 长度数组 JSON 字符串 */
    private String weekdayDistribution;

    private LocalDate peakDay;

    private Integer likedCount;

    /** 关联的报告 ID */
    private Long reportId;

    @TableField(value = "created_at", fill = FieldFill.INSERT)
    private LocalDateTime createdAt;
}