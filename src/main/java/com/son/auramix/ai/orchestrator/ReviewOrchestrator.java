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
import com.son.auramix.ai.statemachine.ReviewStateMachine;
import com.son.auramix.ai.statemachine.ReviewStatus;
import com.son.auramix.ai.statemachine.ReviewTransition;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.Executor;

/**
 * 流水线编排：注入 List<DimensionAgent>（Spring 按 @Order 自动收集），
 * 4 维度 CompletableFuture.supplyAsync 并行执行 → 串行裁决 → 委派 Aggregator 拼 JSON。
 * <p>
 * 内部使用 {@link ReviewStateMachine} 驱动状态流转，
 * PENDING → DIMENSION_REVIEW → JUDGE → (AUTO_RESULT|MANUAL_REVIEW)。
 * 状态转换合法性由状态机校验，进度推送和 SSE 事件保持原有行为不变。
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
     * <p>
     * 状态机驱动流程：
     * <ol>
     *   <li>创建状态机（初始状态 PENDING）</li>
     *   <li>初始化进度骨架 → 转入 DIMENSION_REVIEW</li>
     *   <li>4 维度并行执行 → 汇合结果</li>
     *   <li>PENDING 短路：有异常维度则 DIMENSION_PENDING_SHORT_CIRCUIT → MANUAL_REVIEW</li>
     *   <li>高置信度 FAIL 短路：任一维度 FAIL+confidence>=90 则 DIMENSION_HIGH_CONF_FAIL → AUTO_RESULT</li>
     *   <li>否则 START_JUDGE → JUDGE → JUDGE_COMPLETED_HIGH_CONF/LOW_CONF</li>
     * </ol>
     * 注意：AUTO_RESULT/MANUAL_REVIEW 的实际 DB status 写入由 ReviewServiceImpl.triggerReview 负责，
     * 这里只返回 PipelineResult 让调用方决定终态。
     */
    public PipelineResult execute(ReviewContext ctx, Long recordId) {
        log.info("[AI审核] trackId={} 流水线开始（状态机驱动，4维度并行）", ctx.getTrackId());

        // 0) 创建状态机（初始状态 PENDING）
        ReviewStateMachine sm = ReviewStateMachine.create(ReviewStatus.PENDING);

        // 0.1) 防御性排序
        List<DimensionAgent> sortedAgents = sorter.sort(dimensionAgents);

        // 0.2) 初始化进度骨架 + 推 STARTED 事件
        try {
            progressStore.initProgress(recordId, ctx.getTrackId(), ctx.getTrackTitle(), sortedAgents);
            sseRegistry.send(recordId, ProgressEvent.started(recordId, ctx.getTrackId(),
                ctx.getTrackTitle(), sortedAgents));
        } catch (Exception e) {
            log.warn("[AI审核] trackId={} initProgress/STARTED 异常，继续执行", ctx.getTrackId(), e);
        }

        // 1) PENDING → DIMENSION_REVIEW
        sm.fire(ReviewTransition.LYRICS_FETCHED);  // 歌词已在 triggerReview 中拉取完毕，直接进入维度审核

        // 2) 4 维度并行执行
        List<AgentResult> dims = executeDimensionReview(ctx, recordId, sortedAgents, sm);

        // 3) 短路检测：优先级 PENDING 短路 > 高置信度 FAIL 短路
        AgentResult finalResult;
        boolean hasPending = dims.stream().anyMatch(AgentResult::isPending);
        if (hasPending) {
            // 3a) 维度异常 → 短路转人工
            sm.fire(ReviewTransition.DIMENSION_PENDING_SHORT_CIRCUIT);
            finalResult = buildPendingShortCircuitResult(dims, ctx.getTrackId());
        } else if (shouldShortCircuitHighConfFail(dims)) {
            // 3b) 维度高置信度 FAIL → 跳过 judge，短路自动处理
            sm.fire(ReviewTransition.DIMENSION_HIGH_CONF_FAIL);
            finalResult = buildHighConfFailShortCircuitResult(dims, ctx.getTrackId());
            log.info("[AI审核] trackId={} 维度高置信度FAIL短路，跳过judge", ctx.getTrackId());
        } else {
            // 4) DIMENSION_REVIEW → JUDGE
            sm.fire(ReviewTransition.START_JUDGE);
            // 推 JUDGE_STARTED
            try {
                progressStore.judgeStarted(recordId);
                sseRegistry.send(recordId, ProgressEvent.judgeStarted(recordId, ctx.getTrackId()));
            } catch (Exception e) {
                log.warn("[AI审核] trackId={} judgeStarted 推送异常，继续", ctx.getTrackId(), e);
            }
            // 5) 裁决
            finalResult = reviewJudgeAgent.judge(ctx, dims);
            // JUDGE → AUTO_RESULT or MANUAL_REVIEW（由 confidence 决定）
            ReviewTransition judgeTransition = finalResult.getConfidence() >= 80
                    ? ReviewTransition.JUDGE_COMPLETED_HIGH_CONF
                    : ReviewTransition.JUDGE_COMPLETED_LOW_CONF;
            sm.fire(judgeTransition);
        }
        log.info("[AI审核] trackId={} 最终裁决 verdict={} confidence={} state={}",
            ctx.getTrackId(), finalResult.getVerdict(), finalResult.getConfidence(), sm.getCurrentStatus());

        // 6) 推 JUDGE_DONE 事件
        try {
            progressStore.judgeDone(recordId, finalResult);
            sseRegistry.send(recordId, ProgressEvent.judgeDone(recordId, ctx.getTrackId(), finalResult));
        } catch (Exception e) {
            log.warn("[AI审核] trackId={} judgeDone 推送异常，继续", ctx.getTrackId(), e);
        }

        // 7) 委派 Aggregator 拼 agent_results JSON
        String agentResultsJson;
        try {
            agentResultsJson = aggregator.build(dims, finalResult);
        } catch (Exception e) {
            log.error("[AI审核] trackId={} Aggregator 序列化失败，使用空 JSON", ctx.getTrackId(), e);
            agentResultsJson = "{}";
        }

        return new PipelineResult(dims, finalResult, agentResultsJson);
    }

    /**
     * 执行维度审核阶段：4 维度并行，单个 agent 异常转 FAIL 占位。
     */
    private List<AgentResult> executeDimensionReview(ReviewContext ctx, Long recordId,
                                                      List<DimensionAgent> sortedAgents,
                                                      ReviewStateMachine sm) {
        List<CompletableFuture<AgentResult>> futures = sortedAgents.stream()
            .map(agent -> CompletableFuture.supplyAsync(
                () -> {
                    String name;
                    try {
                        name = agent.getName();
                    } catch (Exception ignored) {
                        name = agent.getClass().getSimpleName();
                    }
                    // 维度开始
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
                    // 推 DIMENSION_DONE
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

        // 阻塞汇合：保留 @Order 顺序
        List<AgentResult> results = new ArrayList<>();
        for (CompletableFuture<AgentResult> f : futures) {
            results.add(f.join());
        }
        return results;
    }

    /**
     * 检测是否应触发高置信度 FAIL 短路：任一维度 verdict=FAIL 且 confidence>=90。
     */
    private boolean shouldShortCircuitHighConfFail(List<AgentResult> dims) {
        return dims.stream().anyMatch(r -> "FAIL".equals(r.getVerdict()) && r.getConfidence() >= 90);
    }

    /**
     * 构建高置信度 FAIL 短路结果：跳过 judge，直接生成 FAIL 裁决。
     */
    private AgentResult buildHighConfFailShortCircuitResult(List<AgentResult> dims, Long trackId) {
        List<AgentResult> failDims = dims.stream()
                .filter(r -> "FAIL".equals(r.getVerdict()) && r.getConfidence() >= 90)
                .toList();
        String failNames = failDims.stream()
                .map(AgentResult::getAgentName)
                .reduce((a, b) -> a + "," + b)
                .orElse("unknown");
        String reasons = failDims.stream()
                .map(AgentResult::getReason)
                .filter(r -> r != null && !r.isBlank())
                .reduce((a, b) -> a + "; " + b)
                .orElse("高置信度违规");
        return AgentResult.builder()
                .agentName("ReviewJudge")
                .verdict("FAIL")
                .confidence(failDims.get(0).getConfidence())
                .reason("维度[" + failNames + "]高置信度FAIL短路: " + reasons)
                .analysis("短路：维度高置信度FAIL，跳过裁决")
                .build();
    }

    /**
     * 构建 PENDING 短路结果：维度异常时跳过 judge，直接生成 PENDING 裁决。
     */
    private AgentResult buildPendingShortCircuitResult(List<AgentResult> dims, Long trackId) {
        List<AgentResult> pendingDims = dims.stream().filter(AgentResult::isPending).toList();
        String pendingNames = pendingDims.stream()
                .map(AgentResult::getAgentName)
                .reduce((a, b) -> a + "," + b)
                .orElse("unknown");
        String reasons = pendingDims.stream()
                .map(AgentResult::getReason)
                .filter(r -> r != null && !r.isBlank())
                .reduce((a, b) -> a + "; " + b)
                .orElse("维度异常转人工");
        log.warn("[AI审核] trackId={} 检测到维度 PENDING({})，整体降级 PENDING 转人工",
                trackId, pendingNames);
        return AgentResult.builder()
                .agentName("ReviewJudge")
                .verdict("PENDING")
                .confidence(0)
                .reason("维度[" + pendingNames + "]异常，转人工确认: " + reasons)
                .analysis("短路：维度异常，跳过裁决")
                .build();
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
