package com.son.auramix.service.admin.impl;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.son.auramix.ai.aggregator.AgentResultsAggregator;
import com.son.auramix.ai.aggregator.AgentResultsFormatter;
import com.son.auramix.ai.dto.AgentResult;
import com.son.auramix.ai.dto.ReviewContext;
import com.son.auramix.ai.lyrics.LyricsFetcher;
import com.son.auramix.ai.orchestrator.ReviewOrchestrator;
import com.son.auramix.domain.entity.Track;
import com.son.auramix.domain.entity.TrackReviewRecord;
import com.son.auramix.mapper.AlbumMapper;
import com.son.auramix.mapper.ArtistMapper;
import com.son.auramix.mapper.TrackArtistMapper;
import com.son.auramix.mapper.TrackMapper;
import com.son.auramix.mapper.TrackReviewRecordMapper;
import com.son.auramix.common.result.PageResult;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.transaction.PlatformTransactionManager;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * 集成测试：Mock 所有 mapper + 真实 Orchestrator（mock 其内部 agent）。
 * 验证 ReviewServiceImpl 端到端行为：triggerReview 写入 dimensionSummary；
 * listPending 返回 dimensionDetails。
 */
@ExtendWith(MockitoExtension.class)
class ReviewServiceImplIntegrationTest {

    @Mock private TrackMapper trackMapper;
    @Mock private AlbumMapper albumMapper;
    @Mock private ArtistMapper artistMapper;
    @Mock private TrackArtistMapper trackArtistMapper;
    @Mock private TrackReviewRecordMapper reviewRecordMapper;
    @Mock private LyricsFetcher lyricsFetcher;
    @Mock private ReviewOrchestrator orchestrator;
    @Mock private PlatformTransactionManager txManager;
    @Mock private com.son.auramix.ai.progress.ReviewProgressStore progressStore;
    @Mock private com.son.auramix.ai.progress.ReviewProgressSseRegistry sseRegistry;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Test
    void listPending_dimensionDetailsIsFormatted() {
        // 直接构造 service，把真实 Formatter 注入构造函数
        AgentResultsFormatter formatter = new AgentResultsFormatter(objectMapper);
        ReviewServiceImpl service = new ReviewServiceImpl(
            trackMapper, albumMapper, artistMapper, trackArtistMapper,
            reviewRecordMapper, lyricsFetcher, orchestrator, formatter,
            progressStore, sseRegistry, txManager
        );
        ReflectionTestUtils.invokeMethod(service, "initTransactionTemplate");

        // 给 reviewRecordMapper.selectPage 准备分页数据
        String agentResults = "{\"dimensionSummary\":[{\"agentName\":\"A\",\"verdict\":\"PASS\",\"confidence\":90}],"
            + "\"dimensions\":[{\"agentName\":\"A\",\"verdict\":\"PASS\",\"confidence\":90,\"reason\":null}],"
            + "\"judge\":{\"agentName\":\"J\",\"verdict\":\"PASS\",\"confidence\":90,\"failReasons\":null}}";
        TrackReviewRecord record = new TrackReviewRecord();
        record.setId(1L);
        record.setTrackId(100L);
        record.setTrackTitle("测试");
        record.setVerdict(1);
        record.setConfidence(90);
        record.setStatus(1);
        record.setAgentResults(agentResults);

        Page<TrackReviewRecord> page = new Page<>(1, 10);
        page.setRecords(List.of(record));
        // selectPage 是 in-out 语义：传入的 page 会被填上 records 后返回；
        // 实际生产里 MyBatis-Plus 内部会写回 page，mock 也得模拟这个行为，
        // 否则 service 端拿到的本地 page 仍是空的。
        when(reviewRecordMapper.selectPage(any(Page.class), any())).thenAnswer(invocation -> {
            Page<TrackReviewRecord> arg = invocation.getArgument(0);
            arg.setRecords(page.getRecords());
            return arg;
        });

        // when
        PageResult<?> result = service.listPending(1, 10);

        // then
        assertThat(result.getRecords()).hasSize(1);
        Object vo = result.getRecords().get(0);
        String details = (String) ReflectionTestUtils.getField(vo, "dimensionDetails");
        assertThat(details).isEqualTo("A审核通过：置信度90");
    }

    @Test
    void triggerReview_callsFinishedAndCompletesSseOnSuccess() {
        // 构造最小依赖让 triggerReview 走完整流程
        AgentResultsFormatter formatter = new AgentResultsFormatter(objectMapper);
        ReviewServiceImpl service = new ReviewServiceImpl(
            trackMapper, albumMapper, artistMapper, trackArtistMapper,
            reviewRecordMapper, lyricsFetcher, orchestrator, formatter,
            progressStore, sseRegistry, txManager
        );
        ReflectionTestUtils.invokeMethod(service, "initTransactionTemplate");

        Track track = new Track();
        track.setId(100L);
        track.setStatus(0);
        track.setTitle("测试");
        track.setLyricsUrl(null);
        when(trackMapper.selectById(100L)).thenReturn(track);
        when(trackArtistMapper.selectList(any())).thenReturn(java.util.Collections.emptyList());
        when(lyricsFetcher.fetch(any())).thenReturn(null);
        when(lyricsFetcher.hasValidLyrics(any())).thenReturn(false);

        // mock orchestrator.execute(ctx, recordId) 返回一个 PipelineResult
        AgentResult finalResult = AgentResult.builder()
            .agentName("ReviewJudge").verdict("PASS").confidence(90).reason(null).build();
        ReviewOrchestrator.PipelineResult pipeline = new ReviewOrchestrator.PipelineResult(
            java.util.Collections.emptyList(), finalResult, "{}");
        when(orchestrator.execute(any(), any())).thenReturn(pipeline);

        // mock reviewRecordMapper.insert 模拟回填 id
        when(reviewRecordMapper.insert(any(TrackReviewRecord.class))).thenAnswer(inv -> {
            TrackReviewRecord r = inv.getArgument(0);
            r.setId(555L);
            return 1;
        });
        // update 返回 1（条件更新成功）
        when(reviewRecordMapper.update(any(), any())).thenReturn(1);

        // when
        service.triggerReview(100L);

        // then：finished 被调用，SSE complete 被调用
        verify(progressStore).finished(eq(555L), any(), any(), any());
        verify(sseRegistry).send(eq(555L), any());
        verify(sseRegistry).complete(555L);
    }

    @Test
    void triggerReview_completesSseEvenWhenUpdateReturnsZero() {
        AgentResultsFormatter formatter = new AgentResultsFormatter(objectMapper);
        ReviewServiceImpl service = new ReviewServiceImpl(
            trackMapper, albumMapper, artistMapper, trackArtistMapper,
            reviewRecordMapper, lyricsFetcher, orchestrator, formatter,
            progressStore, sseRegistry, txManager
        );
        ReflectionTestUtils.invokeMethod(service, "initTransactionTemplate");

        Track track = new Track();
        track.setId(100L);
        track.setStatus(0);
        track.setTitle("测试");
        track.setLyricsUrl(null);
        when(trackMapper.selectById(100L)).thenReturn(track);
        when(trackArtistMapper.selectList(any())).thenReturn(java.util.Collections.emptyList());
        when(lyricsFetcher.fetch(any())).thenReturn(null);
        when(lyricsFetcher.hasValidLyrics(any())).thenReturn(false);

        AgentResult finalResult = AgentResult.builder()
            .agentName("ReviewJudge").verdict("PASS").confidence(90).reason(null).build();
        ReviewOrchestrator.PipelineResult pipeline = new ReviewOrchestrator.PipelineResult(
            java.util.Collections.emptyList(), finalResult, "{}");
        when(orchestrator.execute(any(), any())).thenReturn(pipeline);

        when(reviewRecordMapper.insert(any(TrackReviewRecord.class))).thenAnswer(inv -> {
            TrackReviewRecord r = inv.getArgument(0);
            r.setId(555L);
            return 1;
        });
        // update 返回 0：表示记录已被人工确认，跳过更新
        when(reviewRecordMapper.update(any(), any())).thenReturn(0);

        service.triggerReview(100L);

        // 即使 updated=0，SSE 也应被 complete 关闭，避免客户端挂死
        verify(sseRegistry).complete(555L);
        // 但不应调用 finished（没有最终落库状态可推）
        verify(progressStore, never()).finished(any(), any(), any(), any());
    }
}
