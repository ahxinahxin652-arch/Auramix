package com.son.auramix.ai.report;

import com.son.auramix.domain.dto.report.StatsAggregateResult;
import com.son.auramix.service.report.PeriodRange;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Component;

import java.time.format.DateTimeFormatter;

/**
 * 周期报告的 Prompt 模板拼装器.
 * 输入统计 JSON, 输出完整 prompt (system 已配, 只拼 user content).
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class ReportPromptBuilder {

    private static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ofPattern("yyyy-MM-dd");

    @Qualifier(ReportChatConfig.REPORT_CHAT_CLIENT)
    private final ChatClient chatClient;

    public ChatClient chatClient() {
        return chatClient;
    }

    /**
     * 构造 user prompt: 用户昵称 + 周期 + 统计 JSON.
     */
    public String buildUserPrompt(String displayName, PeriodRange range, StatsAggregateResult stats) {
        String periodLabel = range.getPeriodType() == PeriodRange.TYPE_WEEKLY ? "本周" : "本月";
        StringBuilder sb = new StringBuilder();
        sb.append("用户昵称：").append(displayName == null ? "亲爱的用户" : displayName).append('\n');
        sb.append("报告周期：").append(periodLabel)
                .append("（").append(range.getPeriodStart().format(DATE_FMT))
                .append(" ~ ").append(range.getPeriodEnd().format(DATE_FMT)).append("）\n");
        sb.append("统计数据 (JSON)：\n");
        sb.append(toJson(stats));
        sb.append("\n\n请基于以上数据生成一份个性化").append(periodLabel).append("听歌报告。");
        return sb.toString();
    }

    private String toJson(StatsAggregateResult stats) {
        // 简化为可读文本格式, 避免引 jackson
        StringBuilder sb = new StringBuilder();
        sb.append("{\n");
        sb.append("  \"totalPlays\": ").append(stats.getTotalPlays()).append(",\n");
        sb.append("  \"totalDurationMin\": ").append(stats.getTotalDurationSec() == null ? 0 : stats.getTotalDurationSec() / 60).append(",\n");
        sb.append("  \"uniqueTracks\": ").append(stats.getUniqueTracks()).append(",\n");
        sb.append("  \"likedCount\": ").append(stats.getLikedCount() == null ? 0 : stats.getLikedCount()).append(",\n");
        sb.append("  \"topTracks\": [");
        appendTop(sb, stats.getTopTracks());
        sb.append("],\n");
        sb.append("  \"topArtists\": [");
        appendTop(sb, stats.getTopArtists());
        sb.append("],\n");
        sb.append("  \"topGenres\": [");
        appendTop(sb, stats.getTopGenres());
        sb.append("],\n");
        sb.append("  \"topAlbums\": [");
        appendTop(sb, stats.getTopAlbums());
        sb.append("],\n");
        sb.append("  \"hourlyDistribution\": ").append(stats.getHourlyDistribution()).append(",\n");
        sb.append("  \"weekdayDistribution\": ").append(stats.getWeekdayDistribution()).append("\n");
        sb.append("}");
        return sb.toString();
    }

    private void appendTop(StringBuilder sb, java.util.List<StatsAggregateResult.TopItem> list) {
        if (list == null || list.isEmpty()) {
            sb.append("[]");
            return;
        }
        sb.append('\n');
        for (int i = 0; i < list.size(); i++) {
            StatsAggregateResult.TopItem t = list.get(i);
            sb.append("    {\"id\":").append(t.getId())
                    .append(",\"name\":\"").append(escape(t.getName())).append('"')
                    .append(",\"count\":").append(t.getCount()).append('}');
            if (i < list.size() - 1) sb.append(',');
            sb.append('\n');
        }
        sb.append("  ");
    }

    private String escape(String s) {
        if (s == null) return "";
        return s.replace("\\", "\\\\").replace("\"", "\\\"");
    }
}