package com.son.auramix.service.analytics;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.son.auramix.domain.dto.analytics.OverviewAnalytics;
import com.son.auramix.domain.entity.Album;
import com.son.auramix.domain.entity.Artist;
import com.son.auramix.domain.entity.PlaybackHistory;
import com.son.auramix.domain.entity.Track;
import com.son.auramix.domain.entity.User;
import com.son.auramix.mapper.AlbumMapper;
import com.son.auramix.mapper.ArtistMapper;
import com.son.auramix.mapper.PlaybackHistoryMapper;
import com.son.auramix.mapper.TrackMapper;
import com.son.auramix.mapper.UserMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 总览看板数据.
 * <p>
 * 核心指标 + 播放趋势 + 新增用户趋势.
 */
@Service
@RequiredArgsConstructor
public class OverviewAnalyticsService {

    private final UserMapper userMapper;
    private final TrackMapper trackMapper;
    private final AlbumMapper albumMapper;
    private final ArtistMapper artistMapper;
    private final PlaybackHistoryMapper playbackHistoryMapper;
    private final AnalyticsCacheService cacheService;

    private static final String CACHE_MODULE = "overview";

    public OverviewAnalytics compute(AnalyticsRange range, boolean forceRefresh) {
        return cacheService.getOrCompute(
                CACHE_MODULE,
                range.getLabel(),
                null,
                forceRefresh,
                () -> doCompute(range)
        );
    }

    private OverviewAnalytics doCompute(AnalyticsRange range) {
        OverviewAnalytics data = new OverviewAnalytics();

        LocalDateTime start = range.getStartDate().atStartOfDay();
        LocalDateTime end = range.getEndDate().plusDays(1).atStartOfDay();

        // 1. 总量 (全表 COUNT, 不受区间限制)
        data.setTotalUsers(userMapper.selectCount(null));
        data.setTotalTracks(trackMapper.selectCount(null));
        data.setTotalAlbums(albumMapper.selectCount(null));
        data.setTotalArtists(artistMapper.selectCount(null));

        // 2. 周期内: 新增用户 / 新增歌曲
        data.setNewUsers(userMapper.selectCount(
                new LambdaQueryWrapper<User>().between(User::getCreatedAt, start, end)));
        data.setNewTracks(trackMapper.selectCount(
                new LambdaQueryWrapper<Track>().between(Track::getCreatedAt, start, end)));

        // 3. 周期内: 总播放数 / 活跃用户
        data.setTotalPlays(playbackHistoryMapper.selectCount(
                new LambdaQueryWrapper<PlaybackHistory>().between(PlaybackHistory::getPlayedAt, start, end)));

        // 4. 活跃用户: 周期内有播放的去重 user_id
        List<PlaybackHistory> activeHistories = playbackHistoryMapper.selectList(
                new LambdaQueryWrapper<PlaybackHistory>()
                        .select(PlaybackHistory::getUserId)
                        .between(PlaybackHistory::getPlayedAt, start, end));
        data.setActiveUsers(activeHistories.stream()
                .map(PlaybackHistory::getUserId)
                .filter(java.util.Objects::nonNull)
                .distinct()
                .count());

        // 5. 播放趋势 (按天聚合)
        data.setPlaysTrend(buildPlaysTrend(range, start, end));

        // 6. 新增用户趋势
        data.setNewUsersTrend(buildNewUsersTrend(range, start, end));

        return data;
    }

    private List<OverviewAnalytics.TrendPoint> buildPlaysTrend(AnalyticsRange range, LocalDateTime start, LocalDateTime end) {
        List<PlaybackHistory> all = playbackHistoryMapper.selectList(
                new LambdaQueryWrapper<PlaybackHistory>()
                        .select(PlaybackHistory::getPlayedAt)
                        .between(PlaybackHistory::getPlayedAt, start, end));

        Map<LocalDate, Long> byDay = new HashMap<>();
        for (PlaybackHistory h : all) {
            if (h.getPlayedAt() == null) continue;
            LocalDate d = h.getPlayedAt().toLocalDate();
            byDay.merge(d, 1L, Long::sum);
        }
        return fillDateRange(range.getStartDate(), range.getEndDate(), byDay);
    }

    private List<OverviewAnalytics.TrendPoint> buildNewUsersTrend(AnalyticsRange range, LocalDateTime start, LocalDateTime end) {
        List<User> all = userMapper.selectList(
                new LambdaQueryWrapper<User>()
                        .select(User::getCreatedAt)
                        .between(User::getCreatedAt, start, end));

        Map<LocalDate, Long> byDay = new HashMap<>();
        for (User u : all) {
            if (u.getCreatedAt() == null) continue;
            LocalDate d = u.getCreatedAt().toLocalDate();
            byDay.merge(d, 1L, Long::sum);
        }
        return fillDateRange(range.getStartDate(), range.getEndDate(), byDay);
    }

    /**
     * 把稀疏的 Map 补全为 [start..end] 的连续序列.
     */
    private List<OverviewAnalytics.TrendPoint> fillDateRange(LocalDate start, LocalDate end, Map<LocalDate, Long> byDay) {
        List<OverviewAnalytics.TrendPoint> list = new ArrayList<>();
        LocalDate cursor = start;
        while (!cursor.isAfter(end)) {
            OverviewAnalytics.TrendPoint p = new OverviewAnalytics.TrendPoint();
            p.setDate(cursor.toString());
            p.setValue(byDay.getOrDefault(cursor, 0L));
            list.add(p);
            cursor = cursor.plusDays(1);
        }
        return list;
    }
}