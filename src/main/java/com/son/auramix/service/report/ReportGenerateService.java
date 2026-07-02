package com.son.auramix.service.report;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.son.auramix.ai.report.ReportFallbackService;
import com.son.auramix.ai.report.ReportGenerationResult;
import com.son.auramix.ai.report.ReportPromptBuilder;
import com.son.auramix.common.exception.BusinessException;
import com.son.auramix.common.result.PageResult;
import com.son.auramix.common.result.ResultCode;
import com.son.auramix.domain.dto.report.StatsAggregateResult;
import com.son.auramix.domain.dto.user.ReportGenerateDTO;
import com.son.auramix.domain.entity.User;
import com.son.auramix.domain.entity.UserListeningStats;
import com.son.auramix.domain.entity.UserPeriodicReport;
import com.son.auramix.domain.vo.user.ReportListItemVO;
import com.son.auramix.domain.vo.user.ReportVO;
import com.son.auramix.mapper.UserListeningStatsMapper;
import com.son.auramix.mapper.UserMapper;
import com.son.auramix.mapper.UserPeriodicReportMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

/**
 * 周期报告生成服务.
 * <p>
 * 异步执行: triggerGenerate 立即返回 reportId, 实际生成在 reportTaskExecutor 线程池里跑.
 * 状态机: 0=GENERATING 1=GENERATED 2=FAILED 3=NO_DATA
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ReportGenerateService {

    public static final int STATUS_GENERATING = 0;
    public static final int STATUS_GENERATED = 1;
    public static final int STATUS_FAILED = 2;
    public static final int STATUS_NO_DATA = 3;

    private final UserPeriodicReportMapper reportMapper;
    private final UserListeningStatsMapper statsMapper;
    private final UserMapper userMapper;
    private final ListeningStatsService listeningStatsService;
    private final ReportPromptBuilder promptBuilder;
    private final ReportFallbackService fallbackService;
    private final ObjectMapper objectMapper;

    /**
     * 同步触发生成 (供 admin 强制重生成 / Job 调用).
     * 返回 reportId.
     */
    @Transactional
    public Long triggerGenerate(Long userId, ReportGenerateDTO dto) {
        PeriodRange range = resolveRange(dto);
        User user = userMapper.selectById(userId);
        if (user == null) {
            throw new BusinessException(ResultCode.BAD_REQUEST, "用户不存在");
        }
        // 先看是否已有该 (user, type, start) 的报告, 有则复用 id 强制重生成
        UserPeriodicReport existing = reportMapper.selectOne(
                new LambdaQueryWrapper<UserPeriodicReport>()
                        .eq(UserPeriodicReport::getUserId, userId)
                        .eq(UserPeriodicReport::getPeriodType, range.getPeriodType())
                        .eq(UserPeriodicReport::getPeriodStart, range.getPeriodStart()));
        if (existing != null) {
            existing.setStatus(STATUS_GENERATING);
            existing.setErrorMessage(null);
            reportMapper.updateById(existing);
            runAsync(existing.getId(), userId, range);
            return existing.getId();
        }
        UserPeriodicReport report = new UserPeriodicReport();
        report.setUserId(userId);
        report.setPeriodType(range.getPeriodType());
        report.setPeriodStart(range.getPeriodStart());
        report.setPeriodEnd(range.getPeriodEnd());
        report.setStatus(STATUS_GENERATING);
        report.setStatsSnapshot("{}");
        reportMapper.insert(report);
        runAsync(report.getId(), userId, range);
        return report.getId();
    }

    /**
     * 异步执行实际生成. 走 reportTaskExecutor 线程池.
     */
    @Async("reportTaskExecutor")
    public void runAsync(Long reportId, Long userId, PeriodRange range) {
        log.info("异步生成报告开始: reportId={}, userId={}, period={}", reportId, userId, range.getLabel());
        try {
            User user = userMapper.selectById(userId);

            // 1. 统计
            StatsAggregateResult stats = listeningStatsService.aggregate(userId, range);
            if (stats.getTotalPlays() == null || stats.getTotalPlays() == 0) {
                // 无数据时也写入占位内容, 让前端详情页有内容可显示
                String periodLabel = range.getPeriodType() == PeriodRange.TYPE_WEEKLY ? "本周" : "本月";
                String noDataSummary = "这" + periodLabel + "你还没有听歌记录, 可能你太忙了。下个周期, 让我们一起发现更多好音乐吧 🎵";
                markStatus(
                    reportId,
                    STATUS_NO_DATA,
                    "本周期内无播放数据",
                    noDataSummary,
                    java.util.Arrays.asList("期待新歌", "再听一会"),
                    java.util.Arrays.asList(
                        "打开音乐库, 选一张专辑开始聆听",
                        "去发现页找一些新歌",
                        "周末听一场完整的演唱会现场"
                    ),
                    java.util.Arrays.asList(
                        "尝试在「发现」中探索新歌单",
                        "把喜欢的歌加入你的收藏",
                        "尝试不同的音乐风格, 也许会有惊喜"
                    )
                );
                log.info("报告无数据, 写占位内容: reportId={}", reportId);
                return;
            }

            // 2. 缓存统计
            saveStats(reportId, userId, range, stats);

            // 3. 调 LLM (失败走降级)
            ReportGenerationResult result;
            String statsJson;
            try {
                String prompt = promptBuilder.buildUserPrompt(user.getDisplayName(), range, stats);
                String raw = promptBuilder.chatClient().prompt()
                        .user(prompt)
                        .call()
                        .content();
                result = parseLlmOutput(raw);
                statsJson = objectMapper.writeValueAsString(stats);
            } catch (Exception ex) {
                log.warn("LLM 调用失败, 走降级模板: reportId={}, err={}", reportId, ex.getMessage());
                result = fallbackService.generateFallback(user.getDisplayName(), range, stats);
                try {
                    statsJson = objectMapper.writeValueAsString(stats);
                } catch (JsonProcessingException jpe) {
                    statsJson = "{}";
                }
            }

            // 4. 写回报告
            markStatus(reportId, STATUS_GENERATED, null,
                    result.getSummary(),
                    result.getMoodTags(),
                    result.getHighlights(),
                    result.getRecommendations());
            // 同时把 stats_snapshot 也补上
            UserPeriodicReport upd = new UserPeriodicReport();
            upd.setId(reportId);
            upd.setStatsSnapshot(statsJson);
            upd.setGeneratedAt(LocalDateTime.now());
            reportMapper.updateById(upd);

            log.info("报告生成完成: reportId={}", reportId);
        } catch (Exception ex) {
            log.error("报告生成失败: reportId={}", reportId, ex);
            markStatus(reportId, STATUS_FAILED, truncate(ex.getMessage(), 480), null, null, null, null);
        }
    }

    /**
     * 查询报告列表 (分页).
     */
    public PageResult<ReportListItemVO> listMyReports(Long userId, Integer periodType, int pageNum, int pageSize) {
        Page<UserPeriodicReport> page = new Page<>(pageNum, pageSize);
        LambdaQueryWrapper<UserPeriodicReport> wrapper = new LambdaQueryWrapper<UserPeriodicReport>()
                .eq(UserPeriodicReport::getUserId, userId)
                .orderByDesc(UserPeriodicReport::getPeriodStart);
        if (periodType != null) wrapper.eq(UserPeriodicReport::getPeriodType, periodType);
        reportMapper.selectPage(page, wrapper);

        List<ReportListItemVO> records = page.getRecords().stream().map(this::toListItem).collect(Collectors.toList());
        return new PageResult<>(page.getCurrent(), page.getSize(), page.getTotal(), page.getPages(), records);
    }

    public ReportVO getReport(Long userId, Long reportId) {
        UserPeriodicReport r = reportMapper.selectById(reportId);
        if (r == null || !r.getUserId().equals(userId)) {
            throw new BusinessException(ResultCode.NOT_FOUND);
        }
        return toVO(r);
    }

    public PageResult<ReportListItemVO> listAllReports(Integer periodType, int pageNum, int pageSize) {
        Page<UserPeriodicReport> page = new Page<>(pageNum, pageSize);
        LambdaQueryWrapper<UserPeriodicReport> wrapper = new LambdaQueryWrapper<UserPeriodicReport>()
                .orderByDesc(UserPeriodicReport::getCreatedAt);
        if (periodType != null) wrapper.eq(UserPeriodicReport::getPeriodType, periodType);
        reportMapper.selectPage(page, wrapper);

        List<ReportListItemVO> records = page.getRecords().stream().map(this::toListItem).collect(Collectors.toList());
        return new PageResult<>(page.getCurrent(), page.getSize(), page.getTotal(), page.getPages(), records);
    }

    // ============================ 私有 ============================

    private PeriodRange resolveRange(ReportGenerateDTO dto) {
        int type = dto.getPeriodType() == null
                ? PeriodRange.TYPE_WEEKLY
                : dto.getPeriodType();
        if (type == PeriodRange.TYPE_MONTHLY) {
            return PeriodRange.lastMonth();
        }
        return PeriodRange.lastWeek();
    }

    private void markStatus(Long reportId, int status, String errorMessage,
                            String summary, List<String> moodTags, List<String> highlights, List<String> recommendations) {
        UserPeriodicReport upd = new UserPeriodicReport();
        upd.setId(reportId);
        upd.setStatus(status);
        upd.setErrorMessage(errorMessage);
        if (summary != null) upd.setLlmSummary(summary);
        if (moodTags != null) upd.setMoodTags(String.join(",", moodTags));
        if (highlights != null) upd.setHighlights(toJsonArray(highlights));
        if (recommendations != null) upd.setRecommendations(toJsonArray(recommendations));
        if (status == STATUS_GENERATED) upd.setGeneratedAt(LocalDateTime.now());
        reportMapper.updateById(upd);
    }

    private void saveStats(Long reportId, Long userId, PeriodRange range, StatsAggregateResult stats) {
        try {
            UserListeningStats s = new UserListeningStats();
            s.setUserId(userId);
            s.setPeriodType(range.getPeriodType());
            s.setPeriodStart(range.getPeriodStart());
            s.setPeriodEnd(range.getPeriodEnd());
            s.setTotalPlays(stats.getTotalPlays() == null ? 0 : stats.getTotalPlays());
            s.setTotalDurationSec(stats.getTotalDurationSec() == null ? 0L : stats.getTotalDurationSec());
            s.setUniqueTracks(stats.getUniqueTracks() == null ? 0 : stats.getUniqueTracks());
            s.setTopTracks(objectMapper.writeValueAsString(stats.getTopTracks()));
            s.setTopArtists(objectMapper.writeValueAsString(stats.getTopArtists()));
            s.setTopGenres(objectMapper.writeValueAsString(stats.getTopGenres()));
            s.setTopAlbums(objectMapper.writeValueAsString(stats.getTopAlbums()));
            s.setHourlyDistribution(objectMapper.writeValueAsString(stats.getHourlyDistribution()));
            s.setWeekdayDistribution(objectMapper.writeValueAsString(stats.getWeekdayDistribution()));
            s.setPeakDay(stats.getPeakDay());
            s.setLikedCount(stats.getLikedCount() == null ? 0 : stats.getLikedCount());
            s.setReportId(reportId);

            // upsert
            UserListeningStats old = statsMapper.selectOne(
                    new LambdaQueryWrapper<UserListeningStats>()
                            .eq(UserListeningStats::getUserId, userId)
                            .eq(UserListeningStats::getPeriodType, range.getPeriodType())
                            .eq(UserListeningStats::getPeriodStart, range.getPeriodStart()));
            if (old != null) {
                s.setId(old.getId());
                statsMapper.updateById(s);
            } else {
                statsMapper.insert(s);
            }
        } catch (JsonProcessingException ex) {
            log.warn("统计 JSON 序列化失败: reportId={}", reportId, ex);
        }
    }

    private String toJsonArray(List<String> list) {
        try {
            return objectMapper.writeValueAsString(list);
        } catch (JsonProcessingException e) {
            return "[]";
        }
    }

    private ReportGenerationResult parseLlmOutput(String raw) throws JsonProcessingException {
        // 容错: 可能带 markdown ```json``` 包裹
        String trimmed = raw == null ? "" : raw.trim();
        if (trimmed.startsWith("```")) {
            int firstLineEnd = trimmed.indexOf('\n');
            if (firstLineEnd > 0) trimmed = trimmed.substring(firstLineEnd + 1);
            if (trimmed.endsWith("```")) trimmed = trimmed.substring(0, trimmed.length() - 3).trim();
        }
        return objectMapper.readValue(trimmed, ReportGenerationResult.class);
    }

    private ReportListItemVO toListItem(UserPeriodicReport r) {
        ReportListItemVO vo = new ReportListItemVO();
        vo.setId(r.getId());
        vo.setUserId(r.getUserId());
        vo.setPeriodType(r.getPeriodType());
        vo.setPeriodStart(r.getPeriodStart() == null ? null : r.getPeriodStart().toString());
        vo.setPeriodEnd(r.getPeriodEnd() == null ? null : r.getPeriodEnd().toString());
        vo.setStatus(r.getStatus());
        vo.setStatusLabel(statusLabel(r.getStatus()));
        vo.setGeneratedAt(r.getGeneratedAt() == null ? null : r.getGeneratedAt().toString());
        vo.setTitle(buildTitle(r));
        return vo;
    }

    private ReportVO toVO(UserPeriodicReport r) {
        ReportVO vo = new ReportVO();
        vo.setId(r.getId());
        vo.setUserId(r.getUserId());
        vo.setPeriodType(r.getPeriodType());
        vo.setPeriodTypeLabel(periodTypeLabel(r.getPeriodType()));
        vo.setPeriodStart(r.getPeriodStart() == null ? null : r.getPeriodStart().toString());
        vo.setPeriodEnd(r.getPeriodEnd() == null ? null : r.getPeriodEnd().toString());
        vo.setStatus(r.getStatus());
        vo.setStatusLabel(statusLabel(r.getStatus()));
        vo.setErrorMessage(r.getErrorMessage());
        vo.setSummary(r.getLlmSummary());
        vo.setMoodTags(splitCsv(r.getMoodTags()));
        vo.setHighlights(parseListJson(r.getHighlights()));
        vo.setRecommendations(parseListJson(r.getRecommendations()));
        vo.setStatsSnapshotJson(r.getStatsSnapshot());
        vo.setGeneratedAt(r.getGeneratedAt() == null ? null : r.getGeneratedAt().toString());
        vo.setCreatedAt(r.getCreatedAt() == null ? null : r.getCreatedAt().toString());
        return vo;
    }

    private List<String> parseListJson(String json) {
        if (json == null || json.isEmpty()) return List.of();
        try {
            return objectMapper.readValue(json,
                    objectMapper.getTypeFactory().constructCollectionType(List.class, String.class));
        } catch (JsonProcessingException e) {
            return List.of();
        }
    }

    private List<String> splitCsv(String csv) {
        if (csv == null || csv.isEmpty()) return List.of();
        return Arrays.stream(csv.split(",")).map(String::trim).filter(s -> !s.isEmpty()).collect(Collectors.toList());
    }

    private String buildTitle(UserPeriodicReport r) {
        String type = periodTypeLabel(r.getPeriodType());
        String start = r.getPeriodStart() == null ? "" : r.getPeriodStart().toString();
        String end = r.getPeriodEnd() == null ? "" : r.getPeriodEnd().toString();
        return String.format("%s (%s ~ %s)", type, start, end);
    }

    private String periodTypeLabel(Integer type) {
        if (type == null) return "未知";
        return type == PeriodRange.TYPE_WEEKLY ? "周报" : "月报";
    }

    private String statusLabel(Integer status) {
        if (status == null) return "未知";
        return switch (status) {
            case STATUS_GENERATING -> "生成中";
            case STATUS_GENERATED -> "已生成";
            case STATUS_FAILED -> "失败";
            case STATUS_NO_DATA -> "无数据";
            default -> "未知";
        };
    }

    private String truncate(String s, int max) {
        if (s == null) return null;
        return s.length() <= max ? s : s.substring(0, max);
    }
}
