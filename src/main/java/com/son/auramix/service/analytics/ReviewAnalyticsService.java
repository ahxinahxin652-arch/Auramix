package com.son.auramix.service.analytics;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.son.auramix.domain.dto.analytics.OverviewAnalytics;
import com.son.auramix.domain.dto.analytics.ReviewAnalytics;
import com.son.auramix.domain.entity.TrackReviewRecord;
import com.son.auramix.mapper.TrackReviewRecordMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 审核维度分析.
 * <p>
 * verdict: 0=待审核, 1=通过, -1=不通过, -2=待人工确认
 * status:  0=AI审核中 1=AI审核完成待自动处理 2=已自动处理 3=待人工确认 4=人工已确认 5=失败
 */
@Service
@RequiredArgsConstructor
public class ReviewAnalyticsService {

    private final TrackReviewRecordMapper reviewRecordMapper;
    private final AnalyticsCacheService cacheService;

    private static final String CACHE_MODULE = "reviews";

    public ReviewAnalytics compute(AnalyticsRange range, boolean forceRefresh) {
        return cacheService.getOrCompute(
                CACHE_MODULE,
                range.getLabel(),
                null,
                forceRefresh,
                () -> doCompute(range)
        );
    }

    private ReviewAnalytics doCompute(AnalyticsRange range) {
        ReviewAnalytics data = new ReviewAnalytics();
        LocalDateTime start = range.getStartDate().atStartOfDay();
        LocalDateTime end = range.getEndDate().plusDays(1).atStartOfDay();

        // 周期内全部审核记录
        List<TrackReviewRecord> records = reviewRecordMapper.selectList(
                new LambdaQueryWrapper<TrackReviewRecord>()
                        .between(TrackReviewRecord::getCreatedAt, start, end));

        data.setTotalRecords(records.size());

        long aiPassed = 0, aiRejected = 0, pending = 0, humanPending = 0, humanConfirmed = 0;
        Map<Integer, Long> verdictDist = new HashMap<>();
        Map<LocalDate, Long> trendByDay = new HashMap<>();

        for (TrackReviewRecord r : records) {
            Integer verdict = r.getVerdict();
            Integer status = r.getStatus();

            if (verdict != null) {
                verdictDist.merge(verdict, 1L, Long::sum);
                if (verdict == 1) aiPassed++;
                else if (verdict == -1) aiRejected++;
                else if (verdict == 0) pending++;
                else if (verdict == -2) humanPending++;
            }
            if (status != null && status == 4) humanConfirmed++;

            if (r.getCreatedAt() != null) {
                trendByDay.merge(r.getCreatedAt().toLocalDate(), 1L, Long::sum);
            }
        }

        data.setAiPassed(aiPassed);
        data.setAiRejected(aiRejected);
        data.setPending(pending);
        data.setHumanPending(humanPending);
        data.setHumanConfirmed(humanConfirmed);
        data.setAiPassRate(data.getTotalRecords() == 0 ? 0d
                : Math.round(aiPassed * 10000d / data.getTotalRecords()) / 100d);

        // verdict 分布
        List<ReviewAnalytics.DistItem> verdictItems = new ArrayList<>();
        verdictItems.add(makeDistItem(1, "通过", verdictDist));
        verdictItems.add(makeDistItem(-1, "不通过", verdictDist));
        verdictItems.add(makeDistItem(0, "待审核", verdictDist));
        verdictItems.add(makeDistItem(-2, "待人工", verdictDist));
        data.setVerdictDist(verdictItems);

        // 趋势 (连续日期)
        List<OverviewAnalytics.TrendPoint> trend = new ArrayList<>();
        LocalDate cursor = range.getStartDate();
        while (!cursor.isAfter(range.getEndDate())) {
            OverviewAnalytics.TrendPoint p = new OverviewAnalytics.TrendPoint();
            p.setDate(cursor.toString());
            p.setValue(trendByDay.getOrDefault(cursor, 0L));
            trend.add(p);
            cursor = cursor.plusDays(1);
        }
        data.setTrend(trend);

        return data;
    }

    private ReviewAnalytics.DistItem makeDistItem(int verdict, String label, Map<Integer, Long> verdictDist) {
        ReviewAnalytics.DistItem item = new ReviewAnalytics.DistItem();
        item.setVerdict(verdict);
        item.setLabel(label);
        item.setCount(verdictDist.getOrDefault(verdict, 0L));
        return item;
    }
}