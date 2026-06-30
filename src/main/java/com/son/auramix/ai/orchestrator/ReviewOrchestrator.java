package com.son.auramix.ai.orchestrator;

import com.son.auramix.ai.agent.DimensionAgent;
import com.son.auramix.ai.agent.ReviewAgentSorter;
import com.son.auramix.ai.agent.ReviewJudgeAgent;
import com.son.auramix.ai.aggregator.AgentResultsAggregator;
import com.son.auramix.ai.dto.AgentResult;
import com.son.auramix.ai.dto.ReviewContext;
import com.son.auramix.ai.progress.ProgressEvent;
import com.son.auramix.ai.progress.ReviewProgressSseRegistry;
import com.son.auramix.ai.progress.ReviewProgressStore;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.Executor;

/**
 * 流水线编排：注入 List<DimensionAgent>（Spring 按 @Order 自动收集），
 * 4 维度 CompletableFuture.supplyAsync 并行执行 → 串行裁决 → 委派 Aggregator 拼 JSON。
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class ReviewOrchestrator {

    /** Spring 自动注入 List<DimensionAgent>（按 @Order 升序） */
    private final List<DimensionAgent> dimensionAgents;
    private final ReviewJudgeAgent reviewJudgeAgent;
    private final AgentResultsAggregator aggregator;
    /** 复用 AsyncConfig 中的 reviewTaskExecutor Bean */
    @Qualifier("reviewTaskExecutor")
    private final Executor reviewTaskExecutor;
    private final ReviewAgentSorter sorter;
    private final ReviewProgressStore progressStore;
    private final ReviewProgressSseRegistry sseRegistry;

    /**
     * 执行审核流水线，返回完整结果（维度结果 + 最终裁决 + agent_results JSON）。
     */
    public PipelineResult execute(ReviewContext ctx, Long recordId) {
        log.info("[AI审核] trackId={} 流水线开始（4维度并行）", ctx.getTrackId());

        // 0) 防御性排序：Spring 已按 @Order 排序，但显式调用 sorter 保持行为一致
        List<DimensionAgent> sortedAgents = sorter.sort(dimensionAgents);

        // 0.1) 初始化进度骨架 + 推 STARTED 事件
        try {
            progressStore.initProgress(recordId, ctx.getTrackId(), ctx.getTrackTitle(), sortedAgents);
            sseRegistry.send(recordId, ProgressEvent.started(recordId, ctx.getTrackId(),
                ctx.getTrackTitle(), sortedAgents));
        } catch (Exception e) {
            log.warn("[AI审核] trackId={} initProgress/STARTED 异常，继续执行", ctx.getTrackId(), e);
        }

        // 1) 4 维度并行：AbstractDimensionAgent.review 内部已有 try-catch 兜底，
        //    但 mock 出来的 DimensionAgent / 边缘 NPE 等场景可能在 review() 阶段直接抛；
        //    这里再加一层保护：单个 agent 异常不会让整条流水线崩，
        //    转成 verdict=FAIL / confidence=0 的占位结果继续走。
        List<CompletableFuture<AgentResult>> futures = sortedAgents.stream()
            .map(agent -> CompletableFuture.supplyAsync(
                () -> {
                    String name;
                    try {
                        name = agent.getName();
                    } catch (Exception ignored) {
                        name = agent.getClass().getSimpleName();
                    }
                    // 维度开始：置 RUNNING + 写 startedAt + 推 DIMENSION_STARTED
                    try {
                        progressStore.dimensionStarted(recordId, name);
                        sseRegistry.send(recordId, ProgressEvent.dimensionStarted(recordId, ctx.getTrackId(), name));
                    } catch (Exception ex) {
                        log.warn("[AI审核] trackId={} dimensionStarted 推送异常，继续", ctx.getTrackId(), ex);
                    }
                    AgentResult r;
                    try {
                        r = agent.review(ctx);
                        log.info("[AI审核] trackId={} agent={} 完成 verdict={} confidence={}",
                            ctx.getTrackId(), r.getAgentName(), r.getVerdict(), r.getConfidence());
                    } catch (Exception e) {
                        log.error("[AI审核] trackId={} agent={} review 异常，转 FAIL 占位", ctx.getTrackId(), name, e);
                        r = AgentResult.builder()
                            .agentName(name)
                            .verdict("FAIL")
                            .confidence(0)
                            .reason("agent调用异常: " + e.getClass().getSimpleName() + " - " + e.getMessage())
                            .build();
                    }
                    // 无论成功/异常，都推送 DIMENSION_DONE
                    try {
                        progressStore.dimensionDone(recordId, r);
                        sseRegistry.send(recordId, ProgressEvent.dimensionDone(recordId, ctx.getTrackId(), r));
                    } catch (Exception ex) {
                        log.warn("[AI审核] trackId={} dimensionDone 推送异常，继续", ctx.getTrackId(), ex);
                    }
                    return r;
                },
                reviewTaskExecutor))
            .toList();

        // 2) 阻塞汇合：保留 @Order 顺序
        List<AgentResult> dims = futures.stream()
            .map(CompletableFuture::join)
            .toList();

        // 3) 裁决 agent 汇总（串行）
        // 3.0) 推 JUDGE_STARTED：让前端展示"正在裁决汇总..."
        try {
            progressStore.judgeStarted(recordId);
            sseRegistry.send(recordId, ProgressEvent.judgeStarted(recordId, ctx.getTrackId()));
        } catch (Exception e) {
            log.warn("[AI审核] trackId={} judgeStarted 推送异常，继续", ctx.getTrackId(), e);
        }
        AgentResult finalResult = reviewJudgeAgent.judge(ctx, dims);
        log.info("[AI审核] trackId={} 最终裁决 verdict={} confidence={}",
            ctx.getTrackId(), finalResult.getVerdict(), finalResult.getConfidence());

        // 3.1) 推 JUDGE_DONE 事件
        try {
            progressStore.judgeDone(recordId, finalResult);
            sseRegistry.send(recordId, ProgressEvent.judgeDone(recordId, ctx.getTrackId(), finalResult));
        } catch (Exception e) {
            log.warn("[AI审核] trackId={} judgeDone 推送异常，继续", ctx.getTrackId(), e);
        }

        // 4) 委派 Aggregator 拼 agent_results JSON
        String agentResultsJson;
        try {
            agentResultsJson = aggregator.build(dims, finalResult);
        } catch (Exception e) {
            log.error("[AI审核] trackId={} Aggregator 序列化失败，使用空 JSON", ctx.getTrackId(), e);
            agentResultsJson = "{}";
        }

        return new PipelineResult(dims, finalResult, agentResultsJson);
    }

    @lombok.Data
    @lombok.AllArgsConstructor
    public static class PipelineResult {
        private List<AgentResult> dimensionResults;
        private AgentResult finalResult;
        /** agent_results JSON 字符串（含 dimensionSummary + dimensions + judge） */
        private String agentResultsJson;
    }
}
