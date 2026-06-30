package com.son.auramix.ai.report;

import com.son.auramix.domain.dto.report.StatsAggregateResult;
import com.son.auramix.service.report.PeriodRange;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.format.DateTimeFormatter;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

/**
 * 报告生成降级服务: LLM 失败/超时/无数据时, 用本地模板拼接保证不阻塞用户.
 */
@Slf4j
@Service
public class ReportFallbackService {

    private static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ofPattern("MM-dd");

    /**
     * 本地模板生成.
     */
    public ReportGenerationResult generateFallback(String displayName, PeriodRange range, StatsAggregateResult stats) {
        log.info("使用降级模板生成报告: user={}, period={}", displayName, range.getLabel());

        // 1. summary
        long totalMin = stats.getTotalDurationSec() == null ? 0 : stats.getTotalDurationSec() / 60;
        StringBuilder summary = new StringBuilder();
        summary.append("这").append(range.getPeriodType() == PeriodRange.TYPE_WEEKLY ? "周" : "月")
                .append("你一共听了 ").append(stats.getTotalPlays()).append(" 次音乐，")
                .append("累计时长 ").append(totalMin).append(" 分钟，")
                .append("涉及 ").append(stats.getUniqueTracks()).append(" 首不同的歌曲。");

        String topTrackName = pickFirstName(stats.getTopTracks());
        if (topTrackName != null) {
            summary.append("《").append(topTrackName).append("》是你这周期里单曲循环最多的歌。");
        }

        // 2. moodTags: 从 top 流派推断
        List<String> moodTags = stats.getTopGenres() == null ? List.of() :
                stats.getTopGenres().stream()
                        .limit(3)
                        .map(StatsAggregateResult.TopItem::getName)
                        .filter(s -> s != null && !s.isEmpty())
                        .collect(Collectors.toList());
        if (moodTags.isEmpty()) {
            moodTags = Arrays.asList("用心聆听", "陪伴时光");
        }

        // 3. highlights: 3 条
        String peak = stats.getPeakDay() == null ? "本周期内" :
                stats.getPeakDay().format(DateTimeFormatter.ofPattern("MM月dd日"));
        List<String> highlights = Arrays.asList(
                peak + " 是你听歌最活跃的一天",
                "TOP 歌曲《" + (topTrackName == null ? "?" : topTrackName) + "》被播放 " +
                        (stats.getTopTracks() == null || stats.getTopTracks().isEmpty() ? 0 : stats.getTopTracks().get(0).getCount()) + " 次",
                "本周期你解锁了 " + stats.getUniqueTracks() + " 首新歌"
        );

        // 4. recommendations: 3 条
        List<String> recs = stats.getTopArtists() == null ? List.of() :
                stats.getTopArtists().stream()
                        .limit(3)
                        .map(StatsAggregateResult.TopItem::getName)
                        .filter(s -> s != null && !s.isEmpty())
                        .map(n -> "继续聆听 " + n + " 的其他作品")
                        .collect(Collectors.toList());
        if (recs.isEmpty()) {
            recs = Arrays.asList("试试热门新歌", "探索你喜爱的歌手更多作品", "换个心情听点不同风格");
        }

        return new ReportGenerationResult(summary.toString(), moodTags, highlights, recs);
    }

    private String pickFirstName(List<StatsAggregateResult.TopItem> list) {
        if (list == null || list.isEmpty()) return null;
        return list.get(0).getName();
    }
}