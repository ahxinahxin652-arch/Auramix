package com.son.auramix.domain.dto.report;

import lombok.Data;

import java.util.List;

/**
 * 用户周期听歌统计聚合结果(内存中, 用于写入 user_listening_stats 或直接喂给 LLM)
 */
@Data
public class StatsAggregateResult {

    private Long userId;

    /** 总播放次数 */
    private Integer totalPlays;

    /** 总听歌时长(秒) */
    private Long totalDurationSec;

    /** 去重歌曲数 */
    private Integer uniqueTracks;

    private List<TopItem> topTracks;

    private List<TopItem> topArtists;

    private List<TopItem> topGenres;

    private List<TopItem> topAlbums;

    /** 长度 24, 元素是 Long, 表示每小时播放次数 */
    private List<Long> hourlyDistribution;

    /** 长度 7, 元素是 Long, 表示周一到周日的播放次数 */
    private List<Long> weekdayDistribution;

    /** 听歌峰值日期 */
    private java.time.LocalDate peakDay;

    /** 周期内新增红心数 */
    private Integer likedCount;

    @Data
    public static class TopItem {
        private Long id;
        private String name;
        private Long count;
    }
}