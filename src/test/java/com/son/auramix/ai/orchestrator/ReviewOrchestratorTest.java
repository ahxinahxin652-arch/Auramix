package com.son.auramix.ai.orchestrator;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.son.auramix.ai.agent.DimensionAgent;
import com.son.auramix.ai.agent.ReviewAgentSorter;
import com.son.auramix.ai.aggregator.AgentResultsAggregator;
import com.son.auramix.ai.dto.AgentResult;
import com.son.auramix.ai.dto.ReviewContext;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.core.task.TaskExecutor;

import java.util.List;
import java.util.concurrent.Executor;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ReviewOrchestratorTest {

    @Mock private DimensionAgent agentA;
    @Mock private DimensionAgent agentB;
    @Mock private com.son.auramix.ai.agent.ReviewJudgeAgent judgeAgent;
    @Mock private TaskExecutor taskExecutor;
    @Mock private com.son.auramix.ai.progress.ReviewProgressStore progressStore;
    @Mock private com.son.auramix.ai.progress.ReviewProgressSseRegistry sseRegistry;

    /** 用同步 executor 让测试不真的并发 */
    private Executor syncExecutor = Runnable::run;

    private ReviewContext ctx() {
        return ReviewContext.builder()
            .trackId(1L).trackTitle("t").artistNames("a").albumTitle("b")
            .lyricsContent("l").hasLyrics(true).reviewType("TEXT_ONLY").build();
    }

    private ReviewOrchestrator buildOrchestrator(List<DimensionAgent> agents) {
        ObjectMapper mapper = new ObjectMapper();
        mapper.registerModule(new com.fasterxml.jackson.datatype.jsr310.JavaTimeModule());
        AgentResultsAggregator aggregator = new AgentResultsAggregator(mapper);
        return new ReviewOrchestrator(agents, judgeAgent, aggregator, syncExecutor,
            new ReviewAgentSorter(), progressStore, sseRegistry);
    }

    @Test
    void execute_preservesAgentOrderInResult() {
        // given 3 个 mock agent，按注入顺序返回不同 verdict
        // 注意：orchestrator 不再调 agent.getName()，只用 AgentResult.agentName，所以不要 stub getName()
        when(agentA.review(any())).thenReturn(AgentResult.builder().agentName("A").verdict("PASS").confidence(80).reason(null).build());
        when(agentB.review(any())).thenReturn(AgentResult.builder().agentName("B").verdict("FAIL").confidence(50).reason("r").build());
        DimensionAgent agentC = org.mockito.Mockito.mock(DimensionAgent.class);
        when(agentC.review(any())).thenReturn(AgentResult.builder().agentName("C").verdict("PASS").confidence(70).reason(null).build());

        ReviewOrchestrator orch = buildOrchestrator(List.of(agentA, agentB, agentC));
        when(judgeAgent.judge(any(), any())).thenReturn(
            AgentResult.builder().agentName("ReviewJudge").verdict("FAIL").confidence(50).reason("r").build()
        );

        // when
        ReviewOrchestrator.PipelineResult result = orch.execute(ctx(), 100L);

        // then: 维度结果保持注入顺序 A, B, C
        assertThat(result.getDimensionResults()).extracting(AgentResult::getAgentName)
            .containsExactly("A", "B", "C");
    }

    @Test
    void execute_aggregatesJsonWithDimensionSummary() throws Exception {
        when(agentA.review(any())).thenReturn(AgentResult.builder().agentName("A").verdict("PASS").confidence(90).reason(null).build());
        when(agentB.review(any())).thenReturn(AgentResult.builder().agentName("B").verdict("FAIL").confidence(40).reason("违规").build());
        when(judgeAgent.judge(any(), any())).thenReturn(
            AgentResult.builder().agentName("ReviewJudge").verdict("FAIL").confidence(40).reason("B: 违规").build()
        );

        ReviewOrchestrator orch = buildOrchestrator(List.of(agentA, agentB));
        ReviewOrchestrator.PipelineResult result = orch.execute(ctx(), 100L);

        // JSON 含 dimensionSummary, dimensions, judge
        String json = result.getAgentResultsJson();
        assertThat(json).isNotNull();
        JsonNode root = new ObjectMapper().readTree(json);
        assertThat(root.has("dimensionSummary")).isTrue();
        assertThat(root.get("dimensionSummary").size()).isEqualTo(2);
        assertThat(root.get("dimensions").size()).isEqualTo(2);
        assertThat(root.has("judge")).isTrue();
    }

    @Test
    void execute_singleAgentFailureDoesNotBreakOthers() {
        when(agentA.review(any())).thenReturn(AgentResult.builder().agentName("A").verdict("PASS").confidence(80).reason(null).build());
        // agentB 抛异常，orchestrator 应当捕获并转成 FAIL 占位，不让整条流水线崩
        when(agentB.review(any())).thenThrow(new RuntimeException("LLM 异常"));
        when(judgeAgent.judge(any(), any())).thenReturn(
            AgentResult.builder().agentName("ReviewJudge").verdict("FAIL").confidence(0).reason("B 异常").build()
        );

        ReviewOrchestrator orch = buildOrchestrator(List.of(agentA, agentB));
        ReviewOrchestrator.PipelineResult result = orch.execute(ctx(), 100L);

        // A 正常返回，B 转成 FAIL 占位
        assertThat(result.getDimensionResults()).hasSize(2);
        assertThat(result.getDimensionResults().get(0).getVerdict()).isEqualTo("PASS");
        assertThat(result.getDimensionResults().get(1).getVerdict()).isEqualTo("FAIL");
        assertThat(result.getDimensionResults().get(1).getReason()).contains("agent调用异常");
    }

    @Test
    void execute_publishesProgressEventsInOrder() {
        when(agentA.review(any())).thenReturn(AgentResult.builder().agentName("A").verdict("PASS").confidence(80).reason(null).build());
        when(agentB.review(any())).thenReturn(AgentResult.builder().agentName("B").verdict("PASS").confidence(70).reason(null).build());
        when(judgeAgent.judge(any(), any())).thenReturn(
            AgentResult.builder().agentName("ReviewJudge").verdict("PASS").confidence(75).reason(null).build()
        );

        ReviewOrchestrator orch = buildOrchestrator(List.of(agentA, agentB));
        orch.execute(ctx(), 100L);

        // 验证调用顺序：initProgress → 2× dimensionDone → judgeDone
        org.mockito.InOrder inOrder = org.mockito.Mockito.inOrder(progressStore);
        inOrder.verify(progressStore).initProgress(eq(100L), any(), any(), any());
        inOrder.verify(progressStore, org.mockito.Mockito.times(2)).dimensionDone(eq(100L), any());
        inOrder.verify(progressStore).judgeDone(eq(100L), any());
    }

    @Test
    void execute_dimensionExceptionStillPublishesDone() {
        when(agentA.review(any())).thenThrow(new RuntimeException("LLM 异常"));
        when(judgeAgent.judge(any(), any())).thenReturn(
            AgentResult.builder().agentName("ReviewJudge").verdict("FAIL").confidence(0).reason("A 异常").build()
        );

        ReviewOrchestrator orch = buildOrchestrator(List.of(agentA));
        orch.execute(ctx(), 100L);

        // 即使 agent 抛异常，dimensionDone 仍被调用（异常已转 FAIL 占位）
        org.mockito.ArgumentCaptor<AgentResult> captor = org.mockito.ArgumentCaptor.forClass(AgentResult.class);
        verify(progressStore).dimensionDone(eq(100L), captor.capture());
        assertThat(captor.getValue().getVerdict()).isEqualTo("FAIL");
        assertThat(captor.getValue().getReason()).contains("agent调用异常");
        // SSE 也应被调用
        verify(sseRegistry, org.mockito.Mockito.atLeastOnce()).send(eq(100L), any());
    }

    @Test
    void execute_progressStoreExceptionDoesNotBreakPipeline() {
        when(agentA.review(any())).thenReturn(AgentResult.builder().agentName("A").verdict("PASS").confidence(80).reason(null).build());
        when(judgeAgent.judge(any(), any())).thenReturn(
            AgentResult.builder().agentName("ReviewJudge").verdict("PASS").confidence(80).reason(null).build()
        );
        // progressStore.dimensionDone 抛异常
        org.mockito.Mockito.doThrow(new RuntimeException("DB 异常"))
            .when(progressStore).dimensionDone(any(), any());

        ReviewOrchestrator orch = buildOrchestrator(List.of(agentA));
        ReviewOrchestrator.PipelineResult result = orch.execute(ctx(), 100L);

        // 流水线仍应正常返回结果（agent_results 不受影响）
        assertThat(result.getDimensionResults()).hasSize(1);
        assertThat(result.getAgentResultsJson()).isNotNull();
    }
}
