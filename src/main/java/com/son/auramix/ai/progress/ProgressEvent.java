package com.son.auramix.ai.progress;

import com.son.auramix.ai.agent.DimensionAgent;
import com.son.auramix.ai.dto.AgentResult;
import org.springframework.core.annotation.Order;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * 构造各 SSE 事件对应的 ReviewProgressVO payload（普通静态工厂，非 Spring ApplicationEvent）。
 * <p>
 * 维度的 displayName 从 agentName 映射；agent 的 @Order 通过 {@link Order} 注解读取。
 */
public final class ProgressEvent {

    /** agentName → 中文显示名映射，与 4 个 DimensionAgent 实现的 getName() 返回值对齐 */
    private static final java.util.Map<String, String> DISPLAY_NAMES = java.util.Map.of(
        "PoliticalSensitivity", "政治敏感",
        "ViolenceTerror", "暴力恐怖",
        "ExplicitContent", "色情低俗",
        "AntiSocial", "反社会"
    );

    private ProgressEvent() {}

    /** STARTED 事件：流水线开始，4 维度全 PENDING，judge PENDING */
    public static ReviewProgressVO started(Long recordId, Long trackId, String trackTitle,
                                           List<DimensionAgent> sortedAgents) {
        ReviewProgressVO vo = base(recordId, trackId, trackTitle);
        vo.setEventType("STARTED");
        vo.setStartedAt(LocalDateTime.now());
        vo.setStage("DIMENSION_PHASE");
        vo.setTotalDimensions(sortedAgents.size());
        vo.setCompletedDimensions(0);

        List<ReviewProgressVO.DimensionProgressVO> dims = new ArrayList<>(sortedAgents.size());
        for (DimensionAgent agent : sortedAgents) {
            ReviewProgressVO.DimensionProgressVO d = new ReviewProgressVO.DimensionProgressVO();
            d.setAgentName(agentNameOf(agent));
            d.setDisplayName(displayNameOf(agent));
            d.setOrder(orderOf(agent));
            d.setStatus("PENDING");
            dims.add(d);
        }
        vo.setDimensions(dims);

        ReviewProgressVO.JudgeProgressVO j = new ReviewProgressVO.JudgeProgressVO();
        j.setStatus("PENDING");
        vo.setJudge(j);
        return vo;
    }

    /** LYRICS_FETCHING 事件：开始拉取歌词 */
    public static ReviewProgressVO lyricsFetching(Long recordId, Long trackId, String trackTitle) {
        ReviewProgressVO vo = base(recordId, trackId, trackTitle);
        vo.setEventType("LYRICS_FETCHING");
        vo.setStartedAt(LocalDateTime.now());
        vo.setStage("LYRICS_PHASE");
        return vo;
    }

    /** LYRICS_DONE 事件：歌词拉取完成，hasLyrics 指示是否拿到有效歌词 */
    public static ReviewProgressVO lyricsDone(Long recordId, Long trackId, String trackTitle, boolean hasLyrics) {
        ReviewProgressVO vo = base(recordId, trackId, trackTitle);
        vo.setEventType("LYRICS_DONE");
        vo.setStage("LYRICS_PHASE");
        // 把歌词拉取结果塞进 judge.reason 会让语义混乱，这里用一个简短的 flag 字段复用 verdict 位
        // —— 不新增 VO 字段，前端按 eventType=LYRICS_DONE + judge.verdict="HAS_LYRICS"/"NO_LYRICS" 判断
        ReviewProgressVO.JudgeProgressVO j = new ReviewProgressVO.JudgeProgressVO();
        j.setStatus("DONE");
        j.setVerdict(hasLyrics ? "HAS_LYRICS" : "NO_LYRICS");
        vo.setJudge(j);
        return vo;
    }

    /** DIMENSION_STARTED 事件：单个维度开始执行（置 RUNNING + 写 startedAt） */
    public static ReviewProgressVO dimensionStarted(Long recordId, Long trackId, String agentName) {
        ReviewProgressVO vo = base(recordId, trackId, trackTitlePlaceholder(trackId));
        vo.setEventType("DIMENSION_STARTED");
        vo.setStage("DIMENSION_PHASE");

        ReviewProgressVO.DimensionProgressVO d = new ReviewProgressVO.DimensionProgressVO();
        d.setAgentName(agentName);
        d.setDisplayName(DISPLAY_NAMES.getOrDefault(agentName, agentName));
        d.setStatus("RUNNING");
        d.setStartedAt(LocalDateTime.now());
        List<ReviewProgressVO.DimensionProgressVO> dims = new ArrayList<>(1);
        dims.add(d);
        vo.setDimensions(dims);
        return vo;
    }

    /** DIMENSION_DONE 事件：单个维度完成（含异常转 FAIL 的占位结果） */
    public static ReviewProgressVO dimensionDone(Long recordId, Long trackId, AgentResult r) {
        ReviewProgressVO vo = base(recordId, trackId, trackTitlePlaceholder(trackId));
        vo.setEventType("DIMENSION_DONE");
        vo.setStage("DIMENSION_PHASE");

        ReviewProgressVO.DimensionProgressVO d = new ReviewProgressVO.DimensionProgressVO();
        d.setAgentName(r.getAgentName());
        d.setDisplayName(DISPLAY_NAMES.getOrDefault(r.getAgentName(), r.getAgentName()));
        d.setStatus("DONE");
        d.setVerdict(r.getVerdict());
        d.setConfidence(r.getConfidence());
        d.setReason(r.getReason());
        d.setFinishedAt(LocalDateTime.now());
        List<ReviewProgressVO.DimensionProgressVO> dims = new ArrayList<>(1);
        dims.add(d);
        vo.setDimensions(dims);
        return vo;
    }

    /** JUDGE_STARTED 事件：裁决 agent 开始汇总 */
    public static ReviewProgressVO judgeStarted(Long recordId, Long trackId) {
        ReviewProgressVO vo = base(recordId, trackId, trackTitlePlaceholder(trackId));
        vo.setEventType("JUDGE_STARTED");
        vo.setStage("JUDGE_PHASE");

        ReviewProgressVO.JudgeProgressVO j = new ReviewProgressVO.JudgeProgressVO();
        j.setStatus("RUNNING");
        j.setStartedAt(LocalDateTime.now());
        vo.setJudge(j);
        return vo;
    }

    /** JUDGE_DONE 事件：裁决完成 */
    public static ReviewProgressVO judgeDone(Long recordId, Long trackId, AgentResult r) {
        ReviewProgressVO vo = base(recordId, trackId, trackTitlePlaceholder(trackId));
        vo.setEventType("JUDGE_DONE");
        vo.setStage("JUDGE_PHASE");

        ReviewProgressVO.JudgeProgressVO j = new ReviewProgressVO.JudgeProgressVO();
        j.setStatus("DONE");
        j.setVerdict(r.getVerdict());
        j.setConfidence(r.getConfidence());
        j.setReason(r.getReason());
        j.setFinishedAt(LocalDateTime.now());
        vo.setJudge(j);
        return vo;
    }

    /** FINISHED 事件：流水线完结 */
    public static ReviewProgressVO finished(Long recordId, Long trackId,
                                            Integer finalStatus, Integer finalVerdict, Integer finalConfidence) {
        ReviewProgressVO vo = base(recordId, trackId, trackTitlePlaceholder(trackId));
        vo.setEventType("FINISHED");
        vo.setStage("FINISHED");
        vo.setFinishedAt(LocalDateTime.now());
        vo.setFinalStatus(finalStatus);
        vo.setFinalVerdict(finalVerdict);
        vo.setFinalConfidence(finalConfidence);
        return vo;
    }

    /** SNAPSHOT 事件：订阅时回放当前全量状态 */
    public static ReviewProgressVO snapshot(Long recordId, ReviewProgressVO fullState) {
        fullState.setEventType("SNAPSHOT");
        fullState.setRecordId(recordId);
        return fullState;
    }

    // ---------- 辅助 ----------

    private static ReviewProgressVO base(Long recordId, Long trackId, String trackTitle) {
        ReviewProgressVO vo = new ReviewProgressVO();
        vo.setRecordId(recordId);
        vo.setTrackId(trackId);
        vo.setTrackTitle(trackTitle);
        return vo;
    }

    /** DIMENSION_DONE/JUDGE_DONE/FINISHED 不需要 trackTitle，给个占位即可，前端按 recordId 订阅 */
    private static String trackTitlePlaceholder(Long trackId) {
        return null;
    }

    /** 优先调 agent.getName()，失败降级到类名（与 ReviewOrchestrator 兜底策略一致） */
    private static String agentNameOf(DimensionAgent agent) {
        try {
            return agent.getName();
        } catch (Exception ignored) {
            return agent.getClass().getSimpleName();
        }
    }

    private static String displayNameOf(DimensionAgent agent) {
        String name = agentNameOf(agent);
        return DISPLAY_NAMES.getOrDefault(name, name);
    }

    private static int orderOf(DimensionAgent agent) {
        Order order = agent.getClass().getAnnotation(Order.class);
        return order != null ? order.value() : Integer.MAX_VALUE;
    }
}
