package com.son.auramix.service.analytics;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.son.auramix.domain.dto.analytics.OverviewAnalytics;
import com.son.auramix.domain.dto.analytics.TrackAnalytics;
import com.son.auramix.domain.entity.Album;
import com.son.auramix.domain.entity.AlbumArtist;
import com.son.auramix.domain.entity.Artist;
import com.son.auramix.domain.entity.LikedTrack;
import com.son.auramix.domain.entity.PlaybackHistory;
import com.son.auramix.domain.entity.Track;
import com.son.auramix.domain.entity.TrackArtist;
import com.son.auramix.mapper.AlbumArtistMapper;
import com.son.auramix.mapper.AlbumMapper;
import com.son.auramix.mapper.ArtistMapper;
import com.son.auramix.mapper.LikedTrackMapper;
import com.son.auramix.mapper.PlaybackHistoryMapper;
import com.son.auramix.mapper.TrackArtistMapper;
import com.son.auramix.mapper.TrackMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * 歌曲维度分析: 状态分布 + 新增趋势 + TOP 播放榜 / TOP 收藏榜.
 */
@Service
@RequiredArgsConstructor
public class TrackAnalyticsService {

    private final TrackMapper trackMapper;
    private final PlaybackHistoryMapper playbackHistoryMapper;
    private final LikedTrackMapper likedTrackMapper;
    private final AlbumMapper albumMapper;
    private final AlbumArtistMapper albumArtistMapper;
    private final TrackArtistMapper trackArtistMapper;
    private final ArtistMapper artistMapper;
    private final AnalyticsCacheService cacheService;

    private static final String CACHE_MODULE = "tracks";

    public TrackAnalytics compute(AnalyticsRange range, String orderBy, boolean forceRefresh) {
        return cacheService.getOrCompute(
                CACHE_MODULE,
                range.getLabel(),
                orderBy == null ? "play" : orderBy,
                forceRefresh,
                () -> doCompute(range)
        );
    }

    private TrackAnalytics doCompute(AnalyticsRange range) {
        TrackAnalytics data = new TrackAnalytics();
        LocalDateTime start = range.getStartDate().atStartOfDay();
        LocalDateTime end = range.getEndDate().plusDays(1).atStartOfDay();

        // 1. 状态分布 (0/1/2/3)
        data.setStatusDist(buildStatusDist());

        // 2. 新增趋势
        data.setNewTracksTrend(buildNewTracksTrend(range, start, end));

        // 3. TOP 播放榜
        data.setTopByPlay(buildTopByPlay(range, start, end, 10));

        // 4. TOP 收藏榜 (按 liked_count 倒序)
        data.setTopByLike(buildTopByLike(10));

        return data;
    }

    private List<OverviewAnalytics.TrendPoint> buildStatusDist() {
        List<Track> all = trackMapper.selectList(
                new LambdaQueryWrapper<Track>().select(Track::getStatus));
        Map<Integer, Long> byStatus = new HashMap<>();
        for (Track t : all) {
            if (t.getStatus() != null) byStatus.merge(t.getStatus(), 1L, Long::sum);
        }
        List<OverviewAnalytics.TrendPoint> list = new ArrayList<>();
        // 固定 4 个状态, 0=正常 1=下架 2=无版权 3=待审核
        String[] labels = {"正常", "下架", "无版权", "待审核"};
        for (int i = 0; i <= 3; i++) {
            OverviewAnalytics.TrendPoint p = new OverviewAnalytics.TrendPoint();
            p.setDate(labels[i]);
            p.setValue(byStatus.getOrDefault(i, 0L));
            list.add(p);
        }
        return list;
    }

    private List<OverviewAnalytics.TrendPoint> buildNewTracksTrend(AnalyticsRange range, LocalDateTime start, LocalDateTime end) {
        List<Track> all = trackMapper.selectList(
                new LambdaQueryWrapper<Track>()
                        .select(Track::getCreatedAt)
                        .between(Track::getCreatedAt, start, end));
        Map<LocalDate, Long> byDay = new HashMap<>();
        for (Track t : all) {
            if (t.getCreatedAt() == null) continue;
            byDay.merge(t.getCreatedAt().toLocalDate(), 1L, Long::sum);
        }
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

    private List<TrackAnalytics.RankItem> buildTopByPlay(AnalyticsRange range, LocalDateTime start, LocalDateTime end, int limit) {
        List<PlaybackHistory> histories = playbackHistoryMapper.selectList(
                new LambdaQueryWrapper<PlaybackHistory>()
                        .select(PlaybackHistory::getTrackId)
                        .between(PlaybackHistory::getPlayedAt, start, end));

        Map<Long, Long> playCount = histories.stream()
                .filter(h -> h.getTrackId() != null)
                .collect(Collectors.groupingBy(PlaybackHistory::getTrackId, Collectors.counting()));

        List<Long> topTrackIds = playCount.entrySet().stream()
                .sorted(Map.Entry.<Long, Long>comparingByValue().reversed())
                .limit(limit)
                .map(Map.Entry::getKey)
                .collect(Collectors.toList());

        if (topTrackIds.isEmpty()) return new ArrayList<>();

        // 批量拉歌曲 / 专辑 / 歌手
        Map<Long, Track> trackMap = trackMapper.selectBatchIds(topTrackIds).stream()
                .collect(Collectors.toMap(Track::getId, t -> t, (a, b) -> a));

        // 关联 album
        List<Long> albumIds = trackMap.values().stream()
                .map(Track::getAlbumId).filter(java.util.Objects::nonNull)
                .distinct().collect(Collectors.toList());
        Map<Long, Album> albumMap = albumIds.isEmpty() ? new HashMap<>()
                : albumMapper.selectBatchIds(albumIds).stream()
                .collect(Collectors.toMap(Album::getId, a -> a, (x, y) -> x));

        // 关联 track_artists → artist
        List<TrackArtist> trackArtists = trackArtistMapper.selectList(
                new LambdaQueryWrapper<TrackArtist>().in(TrackArtist::getTrackId, topTrackIds));
        Map<Long, List<TrackArtist>> trackArtistMap = trackArtists.stream()
                .collect(Collectors.groupingBy(TrackArtist::getTrackId));
        List<Long> artistIds = trackArtists.stream()
                .map(TrackArtist::getArtistId).filter(java.util.Objects::nonNull)
                .distinct().collect(Collectors.toList());
        Map<Long, Artist> artistMap = artistIds.isEmpty() ? new HashMap<>()
                : artistMapper.selectBatchIds(artistIds).stream()
                .collect(Collectors.toMap(Artist::getId, a -> a, (x, y) -> x));

        List<TrackAnalytics.RankItem> result = new ArrayList<>();
        for (Long tid : topTrackIds) {
            Track t = trackMap.get(tid);
            if (t == null) continue;
            TrackAnalytics.RankItem item = new TrackAnalytics.RankItem();
            item.setTrackId(tid);
            item.setTitle(t.getTitle());
            item.setValue(playCount.getOrDefault(tid, 0L));
            if (t.getAlbumId() != null) {
                Album album = albumMap.get(t.getAlbumId());
                if (album != null) item.setAlbumTitle(album.getTitle());
            }
            List<TrackArtist> tas = trackArtistMap.getOrDefault(tid, new ArrayList<>());
            String artistNames = tas.stream()
                    .map(ta -> artistMap.get(ta.getArtistId()))
                    .filter(java.util.Objects::nonNull)
                    .map(Artist::getName)
                    .collect(Collectors.joining(", "));
            item.setArtists(artistNames);
            result.add(item);
        }
        result.sort(Comparator.comparingLong(TrackAnalytics.RankItem::getValue).reversed());
        return result;
    }

    private List<TrackAnalytics.RankItem> buildTopByLike(int limit) {
        List<Track> all = trackMapper.selectList(
                new LambdaQueryWrapper<Track>()
                        .select(Track::getId, Track::getTitle, Track::getAlbumId, Track::getLikedCount)
                        .orderByDesc(Track::getLikedCount)
                        .last("LIMIT " + limit));

        if (all.isEmpty()) return new ArrayList<>();

        List<Long> albumIds = all.stream()
                .map(Track::getAlbumId).filter(java.util.Objects::nonNull)
                .distinct().collect(Collectors.toList());
        Map<Long, Album> albumMap = albumIds.isEmpty() ? new HashMap<>()
                : albumMapper.selectBatchIds(albumIds).stream()
                .collect(Collectors.toMap(Album::getId, a -> a, (x, y) -> x));

        List<Long> trackIds = all.stream().map(Track::getId).collect(Collectors.toList());
        List<TrackArtist> trackArtists = trackArtistMapper.selectList(
                new LambdaQueryWrapper<TrackArtist>().in(TrackArtist::getTrackId, trackIds));
        Map<Long, List<TrackArtist>> trackArtistMap = trackArtists.stream()
                .collect(Collectors.groupingBy(TrackArtist::getTrackId));
        List<Long> artistIds = trackArtists.stream()
                .map(TrackArtist::getArtistId).filter(java.util.Objects::nonNull)
                .distinct().collect(Collectors.toList());
        Map<Long, Artist> artistMap = artistIds.isEmpty() ? new HashMap<>()
                : artistMapper.selectBatchIds(artistIds).stream()
                .collect(Collectors.toMap(Artist::getId, a -> a, (x, y) -> x));

        List<TrackAnalytics.RankItem> result = new ArrayList<>();
        for (Track t : all) {
            TrackAnalytics.RankItem item = new TrackAnalytics.RankItem();
            item.setTrackId(t.getId());
            item.setTitle(t.getTitle());
            item.setValue(t.getLikedCount() == null ? 0L : t.getLikedCount());
            if (t.getAlbumId() != null) {
                Album album = albumMap.get(t.getAlbumId());
                if (album != null) item.setAlbumTitle(album.getTitle());
            }
            List<TrackArtist> tas = trackArtistMap.getOrDefault(t.getId(), new ArrayList<>());
            String artistNames = tas.stream()
                    .map(ta -> artistMap.get(ta.getArtistId()))
                    .filter(java.util.Objects::nonNull)
                    .map(Artist::getName)
                    .collect(Collectors.joining(", "));
            item.setArtists(artistNames);
            result.add(item);
        }
        return result;
    }
}