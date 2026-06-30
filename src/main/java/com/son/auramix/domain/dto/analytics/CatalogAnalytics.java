package com.son.auramix.domain.dto.analytics;

import lombok.Data;

import java.util.List;

/**
 * 歌手 / 专辑维度分析数据.
 * <p>
 * type=artist 或 type=album.
 */
@Data
public class CatalogAnalytics {

    /** artist 或 album */
    private String type;

    private long total;

    private List<OverviewAnalytics.TrendPoint> newTrend;

    /** 热度榜 (按播放聚合 / 关注聚合) */
    private List<RankItem> hotRank;

    /** 关注榜 (仅 artist) */
    private List<RankItem> followRank;

    @Data
    public static class RankItem {
        private Long id;
        private String name;
        private String coverUrl;
        private long value;
    }
}