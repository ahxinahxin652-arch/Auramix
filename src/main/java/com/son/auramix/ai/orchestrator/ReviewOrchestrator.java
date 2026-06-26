package com.son.auramix.ai.orchestrator;

import com.son.auramix.ai.agent.*;
import com.son.auramix.ai.dto.AgentResult;
import com.son.auramix.ai.dto.ReviewContext;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

/**
 * 流水线编排：4 维度 agent 串行执行 → 裁决 agent 汇总
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class ReviewOrchestrator {

    private final PoliticalSensitivityAgent politicalSensitivityAgent;
    private final ViolenceTerrorAgent violenceTerrorAgent;
    private final ExplicitContentAgent explicitContentAgent;
    private final AntiSocialAgent antiSocialAgent;
    private final ReviewJudgeAgent reviewJudgeAgent;

    /**
     * 流水线执行结果，包含 4 维度结果和最终裁决
     */
    @Data
    @AllArgsConstructor
    public static class PipelineResult {
        private List<AgentResult> dimensionResults;
        private AgentResult finalResult;
    }

    /**
     * 执行审核流水线，返回完整结果（维度结果 + 最终裁决）
     */
    public PipelineResult execute(ReviewContext ctx) {
        List<AgentResult> dimensionResults = new ArrayList<>();

        // 4 维度 agent 串行执行
        log.info("[AI审核] trackId={} 流水线开始", ctx.getTrackId());

        AgentResult r1 = politicalSensitivityAgent.review(ctx);
        log.info("[AI审核] trackId={} agent={} 完成 verdict={} confidence={}",
                ctx.getTrackId(), r1.getAgentName(), r1.getVerdict(), r1.getConfidence());
        dimensionResults.add(r1);

        AgentResult r2 = violenceTerrorAgent.review(ctx);
        log.info("[AI审核] trackId={} agent={} 完成 verdict={} confidence={}",
                ctx.getTrackId(), r2.getAgentName(), r2.getVerdict(), r2.getConfidence());
        dimensionResults.add(r2);

        AgentResult r3 = explicitContentAgent.review(ctx);
        log.info("[AI审核] trackId={} agent={} 完成 verdict={} confidence={}",
                ctx.getTrackId(), r3.getAgentName(), r3.getVerdict(), r3.getConfidence());
        dimensionResults.add(r3);

        AgentResult r4 = antiSocialAgent.review(ctx);
        log.info("[AI审核] trackId={} agent={} 完成 verdict={} confidence={}",
                ctx.getTrackId(), r4.getAgentName(), r4.getVerdict(), r4.getConfidence());
        dimensionResults.add(r4);

        // 裁决 agent 汇总
        AgentResult finalResult = reviewJudgeAgent.judge(ctx, dimensionResults);
        log.info("[AI审核] trackId={} 最终裁决 verdict={} confidence={}",
                ctx.getTrackId(), finalResult.getVerdict(), finalResult.getConfidence());

        return new PipelineResult(dimensionResults, finalResult);
    }

    /**
     * 构建所有 agent 结果的完整 JSON（用于持久化）
     */
    public String buildAgentResultsJson(List<AgentResult> dimensionResults, AgentResult judgeResult) {
        StringBuilder sb = new StringBuilder();
        sb.append("{\"dimensions\":[");
        for (int i = 0; i < dimensionResults.size(); i++) {
            AgentResult ar = dimensionResults.get(i);
            if (i > 0) sb.append(",");
            sb.append("{\"agentName\":\"").append(ar.getAgentName()).append("\"");
            sb.append(",\"verdict\":\"").append(ar.getVerdict()).append("\"");
            sb.append(",\"confidence\":").append(ar.getConfidence());
            sb.append(",\"reason\":").append(ar.getReason() != null ? "\"" + escapeJson(ar.getReason()) + "\"" : "null");
            sb.append("}");
        }
        sb.append("],\"judge\":{");
        sb.append("\"agentName\":\"").append(judgeResult.getAgentName()).append("\"");
        sb.append(",\"verdict\":\"").append(judgeResult.getVerdict()).append("\"");
        sb.append(",\"confidence\":").append(judgeResult.getConfidence());
        sb.append(",\"failReasons\":").append(judgeResult.getReason() != null ? "\"" + escapeJson(judgeResult.getReason()) + "\"" : "null");
        sb.append("}}");
        return sb.toString();
    }

    private String escapeJson(String text) {
        if (text == null) return "";
        return text.replace("\\", "\\\\").replace("\"", "\\\"").replace("\n", "\\n").replace("\r", "\\r");
    }
}
