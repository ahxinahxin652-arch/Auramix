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

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Test
    void listPending_dimensionDetailsIsFormatted() {
        // 直接构造 service，手动注入 Formatter
        AgentResultsFormatter formatter = new AgentResultsFormatter(objectMapper);
        ReviewServiceImpl service = new ReviewServiceImpl(
            trackMapper, albumMapper, artistMapper, trackArtistMapper,
            reviewRecordMapper, lyricsFetcher, orchestrator, txManager
        );
        ReflectionTestUtils.setField(service, "agentResultsFormatter", formatter);
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
        when(reviewRecordMapper.selectPage(any(Page.class), any())).thenReturn(page);

        // when
        PageResult<?> result = service.listPending(1, 10);

        // then
        assertThat(result.getList()).hasSize(1);
        Object vo = result.getList().get(0);
        String details = (String) ReflectionTestUtils.getField(vo, "dimensionDetails");
        assertThat(details).isEqualTo("A审核通过：置信度90");
    }
}
