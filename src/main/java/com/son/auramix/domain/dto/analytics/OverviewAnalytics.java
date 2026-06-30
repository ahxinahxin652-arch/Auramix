package com.son.auramix.domain.dto.analytics;

import lombok.Data;

import java.util.List;

/**
 * 总览看板数据.
 */
@Data
public class OverviewAnalytics {

    /** 核心指标卡 */
    private long totalUsers;
    private long activeUsers;       // 周期内有过播放
    private long totalTracks;
    private long totalAlbums;
    private long totalArtists;
    private long totalPlays;        // 周期播放数
    private long newUsers;          // 周期内新增用户
    private long newTracks;         // 周期内新增歌曲

    /** 趋势(每日) */
    private List<TrendPoint> playsTrend;
    private List<TrendPoint> newUsersTrend;

    @Data
    public static class TrendPoint {
        private String date;       // yyyy-MM-dd
        private long value;
    }
}