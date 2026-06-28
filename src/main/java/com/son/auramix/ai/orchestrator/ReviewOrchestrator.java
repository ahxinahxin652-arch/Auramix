package com.son.auramix.ai.orchestrator;

import com.son.auramix.ai.agent.DimensionAgent;
import com.son.auramix.ai.agent.ReviewAgentSorter;
import com.son.auramix.ai.agent.ReviewJudgeAgent;
import com.son.auramix.ai.aggregator.AgentResultsAggregator;
import com.son.auramix.ai.dto.AgentResult;
import com.son.auramix.ai.dto.ReviewContext;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
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
    /** 复用 AsyncConfig 中的 reviewTaskExecutor Bean（注入为 Executor 类型） */
    private final Executor reviewTaskExecutor;
    private final ReviewAgentSorter sorter;

    /**
     * 执行审核流水线，返回完整结果（维度结果 + 最终裁决 + agent_results JSON）。
     */
    public PipelineResult execute(ReviewContext ctx) {
        log.info("[AI审核] trackId={} 流水线开始（4维度并行）", ctx.getTrackId());

        // 0) 防御性排序：Spring 已按 @Order 排序，但显式调用 sorter 保持行为一致
        List<DimensionAgent> sortedAgents = sorter.sort(dimensionAgents);

        // 1) 4 维度并行：单个 agent 异常被 AbstractDimensionAgent.review 内部 try-catch 兜底
        List<CompletableFuture<AgentResult>> futures = sortedAgents.stream()
            .map(agent -> CompletableFuture.supplyAsync(
                () -> {
                    AgentResult r = agent.review(ctx);
                    log.info("[AI审核] trackId={} agent={} 完成 verdict={} confidence={}",
                        ctx.getTrackId(), r.getAgentName(), r.getVerdict(), r.getConfidence());
                    return r;
                },
                reviewTaskExecutor))
            .toList();

        // 2) 阻塞汇合：保留 @Order 顺序
        List<AgentResult> dims = futures.stream()
            .map(CompletableFuture::join)
            .toList();

        // 3) 裁决 agent 汇总（串行）
        AgentResult finalResult = reviewJudgeAgent.judge(ctx, dims);
        log.info("[AI审核] trackId={} 最终裁决 verdict={} confidence={}",
            ctx.getTrackId(), finalResult.getVerdict(), finalResult.getConfidence());

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
