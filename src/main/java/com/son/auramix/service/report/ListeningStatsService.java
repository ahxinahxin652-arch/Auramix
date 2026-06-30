package com.son.auramix.service.report;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.son.auramix.domain.dto.report.StatsAggregateResult;
import com.son.auramix.domain.entity.PlaybackHistory;
import com.son.auramix.domain.entity.Track;
import com.son.auramix.mapper.PlaybackHistoryMapper;
import com.son.auramix.mapper.TrackMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * 周期听歌统计核心聚合服务.
 * <p>
 * 数据源: playback_history + tracks + (后续) track_artists/album_artists.
 * 实现原则: 全部走 MyBatis-Plus QueryWrapper, 不写 XML.
 */
@Service
@RequiredArgsConstructor
public class ListeningStatsService {

    private final PlaybackHistoryMapper playbackHistoryMapper;
    private final TrackMapper trackMapper;

    /**
     * 计算指定用户在指定周期内的听歌统计.
     * 不写库, 只返回内存对象.
     */
    public StatsAggregateResult aggregate(Long userId, PeriodRange range) {
        StatsAggregateResult result = new StatsAggregateResult();
        result.setUserId(userId);

        LocalDateTime start = range.getPeriodStart().atStartOfDay();
        // 半开区间: [start, end+1)
        LocalDateTime end = range.getPeriodEnd().plusDays(1).atStartOfDay();

        // 1) 拉本周期全部播放历史
        List<PlaybackHistory> histories = playbackHistoryMapper.selectList(
                new LambdaQueryWrapper<PlaybackHistory>()
                        .eq(PlaybackHistory::getUserId, userId)
                        .between(PlaybackHistory::getPlayedAt, start, end)
        );

        if (histories.isEmpty()) {
            result.setTotalPlays(0);
            result.setTotalDurationSec(0L);
            result.setUniqueTracks(0);
            result.setTopTracks(new ArrayList<>());
            result.setTopArtists(new ArrayList<>());
            result.setTopGenres(new ArrayList<>());
            result.setTopAlbums(new ArrayList<>());
            result.setHourlyDistribution(initHourly());
            result.setWeekdayDistribution(initWeekday());
            result.setLikedCount(0);
            return result;
        }

        result.setTotalPlays(histories.size());

        // 2) 批量拉 tracks 用于拿 duration / albumId / title
        List<Long> trackIds = histories.stream()
                .map(PlaybackHistory::getTrackId)
                .distinct()
                .collect(Collectors.toList());
        Map<Long, Track> trackMap = trackMapper.selectBatchIds(trackIds).stream()
                .collect(Collectors.toMap(Track::getId, t -> t, (a, b) -> a));

        // 3) 总时长 (毫秒 → 秒)
        long totalDurationMs = 0L;
        for (PlaybackHistory h : histories) {
            Track t = trackMap.get(h.getTrackId());
            if (t != null && t.getDuration() != null) {
                totalDurationMs += t.getDuration();
            }
        }
        result.setTotalDurationSec(totalDurationMs / 1000L);

        // 4) 去重歌曲数
        result.setUniqueTracks((int) trackIds.stream().distinct().count());

        // 5) TOP 歌曲 (按播放次数)
        Map<Long, Long> trackPlayCount = histories.stream()
                .collect(Collectors.groupingBy(PlaybackHistory::getTrackId, Collectors.counting()));
        result.setTopTracks(buildTopTracks(trackPlayCount, trackMap, 10));

        // 6) 按时段分布 (HOUR)
        List<Long> hourly = initHourly();
        for (PlaybackHistory h : histories) {
            int hour = h.getPlayedAt().getHour();
            hourly.set(hour, hourly.get(hour) + 1);
        }
        result.setHourlyDistribution(hourly);

        // 7) 按周分布 (MONDAY=0 .. SUNDAY=6)
        List<Long> weekday = initWeekday();
        for (PlaybackHistory h : histories) {
            // DayOfWeek: MONDAY=1 .. SUNDAY=7, 减 1 转 0..6
            int dow = h.getPlayedAt().getDayOfWeek().getValue() - 1;
            weekday.set(dow, weekday.get(dow) + 1);
        }
        result.setWeekdayDistribution(weekday);

        // 8) 峰值日 (按天聚合找 MAX)
        Map<java.time.LocalDate, Long> dayCount = histories.stream()
                .collect(Collectors.groupingBy(h -> h.getPlayedAt().toLocalDate(), Collectors.counting()));
        result.setPeakDay(dayCount.entrySet().stream()
                .max(Comparator.comparingLong(Map.Entry::getValue))
                .map(Map.Entry::getKey)
                .orElse(null));

        // 9) TOP 专辑 (通过 track → albumId 聚合)
        Map<Long, Long> albumPlayCount = new HashMap<>();
        for (PlaybackHistory h : histories) {
            Track t = trackMap.get(h.getTrackId());
            if (t != null && t.getAlbumId() != null) {
                albumPlayCount.merge(t.getAlbumId(), 1L, Long::sum);
            }
        }
        // 专辑名仍需后续 JOIN (AlbumMapper), 这里先填充 id+count, 名称在调用方按需补
        List<StatsAggregateResult.TopItem> topAlbums = albumPlayCount.entrySet().stream()
                .sorted(Map.Entry.<Long, Long>comparingByValue().reversed())
                .limit(10)
                .map(e -> {
                    StatsAggregateResult.TopItem item = new StatsAggregateResult.TopItem();
                    item.setId(e.getKey());
                    item.setCount(e.getValue());
                    item.setName(null); // 调用方补
                    return item;
                })
                .collect(Collectors.toList());
        result.setTopAlbums(topAlbums);

        // 10) TOP 歌手 / TOP 流派 暂时留空 (需要 track_artists / track_genres 聚合)
        result.setTopArtists(new ArrayList<>());
        result.setTopGenres(new ArrayList<>());

        // 11) liked_count: 调用方根据 liked_tracks.liked_at 在区间内再统计
        result.setLikedCount(0);

        return result;
    }

    private List<Long> initHourly() {
        List<Long> list = new ArrayList<>(24);
        for (int i = 0; i < 24; i++) list.add(0L);
        return list;
    }

    private List<Long> initWeekday() {
        List<Long> list = new ArrayList<>(7);
        for (int i = 0; i < 7; i++) list.add(0L);
        return list;
    }

    private List<StatsAggregateResult.TopItem> buildTopTracks(
            Map<Long, Long> trackPlayCount, Map<Long, Track> trackMap, int limit) {
        return trackPlayCount.entrySet().stream()
                .sorted(Map.Entry.<Long, Long>comparingByValue().reversed())
                .limit(limit)
                .map(e -> {
                    StatsAggregateResult.TopItem item = new StatsAggregateResult.TopItem();
                    item.setId(e.getKey());
                    item.setCount(e.getValue());
                    Track t = trackMap.get(e.getKey());
                    if (t != null) {
                        item.setName(t.getTitle());
                    }
                    return item;
                })
                .collect(Collectors.toList());
    }
}