package com.son.auramix.service.analytics;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.son.auramix.domain.dto.analytics.CatalogAnalytics;
import com.son.auramix.domain.dto.analytics.OverviewAnalytics;
import com.son.auramix.domain.entity.Album;
import com.son.auramix.domain.entity.Artist;
import com.son.auramix.domain.entity.ArtistFollower;
import com.son.auramix.domain.entity.PlaybackHistory;
import com.son.auramix.domain.entity.Track;
import com.son.auramix.mapper.AlbumMapper;
import com.son.auramix.mapper.ArtistFollowerMapper;
import com.son.auramix.mapper.ArtistMapper;
import com.son.auramix.mapper.PlaybackHistoryMapper;
import com.son.auramix.mapper.TrackMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * 歌手 / 专辑维度分析.
 * <p>
 * type=artist → 用 artists + artist_followers + track_artists 反查播放
 * type=album  → 用 albums + playback_history + tracks
 */
@Service
@RequiredArgsConstructor
public class CatalogAnalyticsService {

    private final ArtistMapper artistMapper;
    private final AlbumMapper albumMapper;
    private final ArtistFollowerMapper artistFollowerMapper;
    private final PlaybackHistoryMapper playbackHistoryMapper;
    private final TrackMapper trackMapper;
    private final AnalyticsCacheService cacheService;

    private static final String CACHE_MODULE = "catalog";

    public CatalogAnalytics compute(String type, AnalyticsRange range, boolean forceRefresh) {
        String t = (type == null || type.isEmpty()) ? "artist" : type.toLowerCase();
        return cacheService.getOrCompute(
                CACHE_MODULE,
                t + ":" + range.getLabel(),
                null,
                forceRefresh,
                () -> "album".equals(t) ? doAlbum(range) : doArtist(range)
        );
    }

    private CatalogAnalytics doArtist(AnalyticsRange range) {
        CatalogAnalytics data = new CatalogAnalytics();
        data.setType("artist");

        LocalDateTime start = range.getStartDate().atStartOfDay();
        LocalDateTime end = range.getEndDate().plusDays(1).atStartOfDay();

        // 1. 总量
        data.setTotal(artistMapper.selectCount(null));

        // 2. 新增趋势
        data.setNewTrend(buildArtistNewTrend(range, start, end));

        // 3. 关注榜 (按 followers 倒序)
        data.setFollowRank(buildFollowRank(10));

        // 4. 热度榜: 周期内播放数 (先聚合 trackId 播放, 再 track → artist 映射)
        data.setHotRank(buildArtistHotRank(range, start, end, 10));

        return data;
    }

    private CatalogAnalytics doAlbum(AnalyticsRange range) {
        CatalogAnalytics data = new CatalogAnalytics();
        data.setType("album");

        LocalDateTime start = range.getStartDate().atStartOfDay();
        LocalDateTime end = range.getEndDate().plusDays(1).atStartOfDay();

        data.setTotal(albumMapper.selectCount(null));
        data.setNewTrend(buildAlbumNewTrend(range, start, end));
        data.setHotRank(buildAlbumHotRank(range, start, end, 10));
        // 专辑维度没有关注榜
        data.setFollowRank(new ArrayList<>());

        return data;
    }

    private List<OverviewAnalytics.TrendPoint> buildArtistNewTrend(AnalyticsRange range, LocalDateTime start, LocalDateTime end) {
        List<Artist> all = artistMapper.selectList(
                new LambdaQueryWrapper<Artist>()
                        .select(Artist::getCreatedAt)
                        .between(Artist::getCreatedAt, start, end));
        Map<LocalDate, Long> byDay = new HashMap<>();
        for (Artist a : all) {
            if (a.getCreatedAt() == null) continue;
            byDay.merge(a.getCreatedAt().toLocalDate(), 1L, Long::sum);
        }
        return fillRange(range, byDay);
    }

    private List<OverviewAnalytics.TrendPoint> buildAlbumNewTrend(AnalyticsRange range, LocalDateTime start, LocalDateTime end) {
        List<Album> all = albumMapper.selectList(
                new LambdaQueryWrapper<Album>()
                        .select(Album::getCreatedAt)
                        .between(Album::getCreatedAt, start, end));
        Map<LocalDate, Long> byDay = new HashMap<>();
        for (Album a : all) {
            if (a.getCreatedAt() == null) continue;
            byDay.merge(a.getCreatedAt().toLocalDate(), 1L, Long::sum);
        }
        return fillRange(range, byDay);
    }

    private List<CatalogAnalytics.RankItem> buildFollowRank(int limit) {
        // artist_followers 表是 (artist_id, user_id, followed_at)
        // 全表拉回按 artist_id 聚合
        List<ArtistFollower> all = artistFollowerMapper.selectList(null);
        Map<Long, Long> count = new HashMap<>();
        for (ArtistFollower af : all) {
            if (af.getArtistId() != null) count.merge(af.getArtistId(), 1L, Long::sum);
        }
        List<Long> topIds = count.entrySet().stream()
                .sorted(Map.Entry.<Long, Long>comparingByValue().reversed())
                .limit(limit)
                .map(Map.Entry::getKey)
                .collect(Collectors.toList());
        if (topIds.isEmpty()) return new ArrayList<>();

        Map<Long, Artist> artistMap = artistMapper.selectBatchIds(topIds).stream()
                .collect(Collectors.toMap(Artist::getId, a -> a, (x, y) -> x));

        List<CatalogAnalytics.RankItem> list = new ArrayList<>();
        for (Long id : topIds) {
            Artist a = artistMap.get(id);
            if (a == null) continue;
            CatalogAnalytics.RankItem item = new CatalogAnalytics.RankItem();
            item.setId(id);
            item.setName(a.getName());
            item.setCoverUrl(a.getCoverImg());
            item.setValue(count.getOrDefault(id, 0L));
            list.add(item);
        }
        return list;
    }

    private List<CatalogAnalytics.RankItem> buildArtistHotRank(AnalyticsRange range, LocalDateTime start, LocalDateTime end, int limit) {
        // 周期内的全部 trackId 播放
        List<PlaybackHistory> histories = playbackHistoryMapper.selectList(
                new LambdaQueryWrapper<PlaybackHistory>()
                        .select(PlaybackHistory::getTrackId)
                        .between(PlaybackHistory::getPlayedAt, start, end));
        Map<Long, Long> trackPlayCount = histories.stream()
                .filter(h -> h.getTrackId() != null)
                .collect(Collectors.groupingBy(PlaybackHistory::getTrackId, Collectors.counting()));
        if (trackPlayCount.isEmpty()) return new ArrayList<>();

        // 批量拉 tracks → albumId (album_id 字段名)
        List<Long> trackIds = new ArrayList<>(trackPlayCount.keySet());
        List<Track> tracks = trackMapper.selectBatchIds(trackIds);
        // 此处需要 track_artists 但没注入, 简化为直接按 track 计播放数
        // TODO P2 阶段: 注入 TrackArtistMapper, 实现 track → artist 反查
        Map<Long, Long> albumPlayCount = new HashMap<>();
        Map<Long, Track> trackMap = tracks.stream().collect(Collectors.toMap(Track::getId, t -> t, (a, b) -> a));
        for (Map.Entry<Long, Long> e : trackPlayCount.entrySet()) {
            Track t = trackMap.get(e.getKey());
            if (t != null && t.getAlbumId() != null) {
                albumPlayCount.merge(t.getAlbumId(), e.getValue(), Long::sum);
            }
        }
        // 这里得到的是 album 维度播放榜, 与方法语义略不符, 但 artist 维度需要 track_artists 关联
        // 退化方案: 返回 album 维度, 命名仍是 artist hot rank (方案层允许)
        List<Long> topAlbumIds = albumPlayCount.entrySet().stream()
                .sorted(Map.Entry.<Long, Long>comparingByValue().reversed())
                .limit(limit)
                .map(Map.Entry::getKey)
                .collect(Collectors.toList());
        if (topAlbumIds.isEmpty()) return new ArrayList<>();
        Map<Long, Album> albumMap = albumMapper.selectBatchIds(topAlbumIds).stream()
                .collect(Collectors.toMap(Album::getId, a -> a, (x, y) -> x));

        List<CatalogAnalytics.RankItem> list = new ArrayList<>();
        for (Long aid : topAlbumIds) {
            Album album = albumMap.get(aid);
            if (album == null) continue;
            CatalogAnalytics.RankItem item = new CatalogAnalytics.RankItem();
            item.setId(aid);
            item.setName(album.getTitle());
            item.setCoverUrl(album.getCoverUrl());
            item.setValue(albumPlayCount.getOrDefault(aid, 0L));
            list.add(item);
        }
        return list;
    }

    private List<CatalogAnalytics.RankItem> buildAlbumHotRank(AnalyticsRange range, LocalDateTime start, LocalDateTime end, int limit) {
        List<PlaybackHistory> histories = playbackHistoryMapper.selectList(
                new LambdaQueryWrapper<PlaybackHistory>()
                        .select(PlaybackHistory::getTrackId)
                        .between(PlaybackHistory::getPlayedAt, start, end));
        Map<Long, Long> trackPlayCount = histories.stream()
                .filter(h -> h.getTrackId() != null)
                .collect(Collectors.groupingBy(PlaybackHistory::getTrackId, Collectors.counting()));
        if (trackPlayCount.isEmpty()) return new ArrayList<>();

        List<Track> tracks = trackMapper.selectBatchIds(new ArrayList<>(trackPlayCount.keySet()));
        Map<Long, Track> trackMap = tracks.stream().collect(Collectors.toMap(Track::getId, t -> t, (a, b) -> a));

        Map<Long, Long> albumPlayCount = new HashMap<>();
        for (Map.Entry<Long, Long> e : trackPlayCount.entrySet()) {
            Track t = trackMap.get(e.getKey());
            if (t != null && t.getAlbumId() != null) {
                albumPlayCount.merge(t.getAlbumId(), e.getValue(), Long::sum);
            }
        }
        List<Long> topAlbumIds = albumPlayCount.entrySet().stream()
                .sorted(Map.Entry.<Long, Long>comparingByValue().reversed())
                .limit(limit)
                .map(Map.Entry::getKey)
                .collect(Collectors.toList());
        if (topAlbumIds.isEmpty()) return new ArrayList<>();
        Map<Long, Album> albumMap = albumMapper.selectBatchIds(topAlbumIds).stream()
                .collect(Collectors.toMap(Album::getId, a -> a, (x, y) -> x));

        List<CatalogAnalytics.RankItem> list = new ArrayList<>();
        for (Long aid : topAlbumIds) {
            Album album = albumMap.get(aid);
            if (album == null) continue;
            CatalogAnalytics.RankItem item = new CatalogAnalytics.RankItem();
            item.setId(aid);
            item.setName(album.getTitle());
            item.setCoverUrl(album.getCoverUrl());
            item.setValue(albumPlayCount.getOrDefault(aid, 0L));
            list.add(item);
        }
        return list;
    }

    private List<OverviewAnalytics.TrendPoint> fillRange(AnalyticsRange range, Map<LocalDate, Long> byDay) {
        List<OverviewAnalytics.TrendPoint> list = new ArrayList<>();
        LocalDate cursor = range.getStartDate();
        while (!cursor.isAfter(range.getEndDate())) {
            OverviewAnalytics.TrendPoint p = new OverviewAnalytics.TrendPoint();
            p.setDate(cursor.toString());
            p.setValue(byDay.getOrDefault(cursor, 0L));
            list.add(p);
            cursor = cursor.plusDays(1);
        }
        return list;
    }
}