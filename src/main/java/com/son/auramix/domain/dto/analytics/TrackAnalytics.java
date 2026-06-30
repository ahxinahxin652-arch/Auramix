package com.son.auramix.domain.dto.analytics;

import lombok.Data;

import java.util.List;

/**
 * 歌曲维度分析数据.
 */
@Data
public class TrackAnalytics {

    /** 状态分布 */
    private List<OverviewAnalytics.TrendPoint> statusDist;

    /** 新增趋势 */
    private List<OverviewAnalytics.TrendPoint> newTracksTrend;

    /** TOP 歌曲: 播放榜 / 收藏榜 */
    private List<RankItem> topByPlay;
    private List<RankItem> topByLike;

    @Data
    public static class RankItem {
        private Long trackId;
        private String title;
        private String albumTitle;
        private String artists;       // 逗号分隔
        private long value;          // 播放数 / 收藏数
    }
}