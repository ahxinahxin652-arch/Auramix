package com.son.auramix.ai.progress;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.son.auramix.ai.agent.DimensionAgent;
import com.son.auramix.ai.dto.AgentResult;
import com.son.auramix.domain.entity.TrackReviewRecord;
import com.son.auramix.mapper.TrackReviewRecordMapper;
import com.son.auramix.mapper.TrackReviewRecordMapper.JsonSetPair;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.function.Consumer;

/**
 * 封装 progress_json 的写入：
 * <ul>
 *   <li>{@link #initProgress} 写骨架（一次性全量写入，无并发问题）</li>
 *   <li>{@link #dimensionStarted} / {@link #dimensionDone} / {@link #judgeStarted} /
 *       {@link #judgeDone} / {@link #finished} 使用 MySQL JSON_SET 字段级原子更新，
 *       避免并发 read-modify-write 丢失更新</li>
 *   <li>{@link #snapshot} 读取并反序列化为 VO</li>
 * </ul>
 * <p>
 * 所有写库异常在内部 try-catch 吞掉记 log，不抛出，不影响主流程。
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class ReviewProgressStore {

    private final TrackReviewRecordMapper reviewRecordMapper;
    private final ObjectMapper objectMapper;

    /** 维度名 → 中文显示名；与 ProgressEvent 中映射保持一致 */
    private static final Map<String, String> DISPLAY_NAMES = Map.of(
        "PoliticalSensitivity", "政治敏感",
        "ViolenceTerror",       "暴力恐怖",
        "ExplicitContent",      "色情低俗",
        "AntiSocial",           "反社会"
    );

    /** 初始化骨架：4 维度 PENDING + judge PENDING + startedAt（一次性全量写入） */
    public void initProgress(Long recordId, Long trackId, String trackTitle,
                             List<DimensionAgent> sortedAgents) {
        try {
            ObjectNode root = objectMapper.createObjectNode();
            root.put("recordId", recordId);
            root.put("trackId", trackId);
            root.put("trackTitle", trackTitle);
            root.put("startedAt", LocalDateTime.now().toString());

            root.put("stage", "DIMENSION_PHASE");
            root.put("totalDimensions", sortedAgents.size());
            root.put("completedDimensions", 0);

            List<ObjectNode> dims = new ArrayList<>(sortedAgents.size());
            for (DimensionAgent agent : sortedAgents) {
                ObjectNode d = objectMapper.createObjectNode();
                String name = agentNameOf(agent);
                d.put("agentName", name);
                d.put("displayName", DISPLAY_NAMES.getOrDefault(name, name));
                d.put("order", orderOf(agent));
                d.put("status", "PENDING");
                d.putNull("verdict");
                d.putNull("confidence");
                d.putNull("reason");
                d.putNull("startedAt");
                d.putNull("finishedAt");
                d.putNull("durationMs");
                dims.add(d);
            }
            root.set("dimensions", objectMapper.valueToTree(dims));

            ObjectNode judge = objectMapper.createObjectNode();
            judge.put("status", "PENDING");
            judge.putNull("verdict");
            judge.putNull("confidence");
            judge.putNull("reason");
            judge.putNull("startedAt");
            judge.putNull("finishedAt");
            judge.putNull("durationMs");
            root.set("judge", judge);

            root.putNull("finishedAt");
            root.putNull("finalStatus");
            root.putNull("finalVerdict");
            root.putNull("finalConfidence");

            writeJson(recordId, objectMapper.writeValueAsString(root));
        } catch (Exception e) {
            log.error("[ReviewProgress] initProgress 异常 recordId={}", recordId, e);
        }
    }

    /** 单维度开始执行：置 RUNNING + 写 startedAt（JSON_SET 字段级更新） */
    public void dimensionStarted(Long recordId, String agentName) {
        int idx = findDimensionIndex(recordId, agentName);
        if (idx < 0) return;
        try {
            List<JsonSetPair> sets = new ArrayList<>();
            sets.add(new JsonSetPair("$.dimensions[" + idx + "].status", "RUNNING", "string"));
            sets.add(new JsonSetPair("$.dimensions[" + idx + "].startedAt", LocalDateTime.now().toString(), "string"));
            reviewRecordMapper.updateProgressJsonFields(recordId, sets);
        } catch (Exception e) {
            log.error("[ReviewProgress] dimensionStarted 异常 recordId={} agent={}", recordId, agentName, e);
        }
    }

    /** 单维度完成：JSON_SET 更新对应维度节点 + completedDimensions 原子递增 */
    public void dimensionDone(Long recordId, AgentResult result) {
        int idx = findDimensionIndex(recordId, result.getAgentName());
        if (idx < 0) {
            log.warn("[ReviewProgress] dimensionDone 未找到 agentName={} recordId={}",
                result.getAgentName(), recordId);
            return;
        }
        try {
            String base = "$.dimensions[" + idx + "]";
            String now = LocalDateTime.now().toString();
            String status = result.isFail() ? "FAIL" : "DONE";

            List<JsonSetPair> sets = new ArrayList<>();
            sets.add(new JsonSetPair(base + ".status", status, "string"));
            sets.add(new JsonSetPair(base + ".verdict", result.getVerdict(), "string"));
            sets.add(new JsonSetPair(base + ".confidence", String.valueOf(result.getConfidence()), "int"));
            if (result.getReason() != null) {
                sets.add(new JsonSetPair(base + ".reason", result.getReason(), "string"));
            } else {
                sets.add(new JsonSetPair(base + ".reason", null, "null"));
            }
            sets.add(new JsonSetPair(base + ".finishedAt", now, "string"));

            // durationMs 需要读 startedAt 计算 — 用一次轻量 select 获取
            TrackReviewRecord r = reviewRecordMapper.selectById(recordId);
            if (r != null && r.getProgressJson() != null) {
                JsonNode root = objectMapper.readTree(r.getProgressJson());
                JsonNode dimNode = root.path("dimensions").path(idx);
                JsonNode startedNode = dimNode.get("startedAt");
                if (startedNode != null && !startedNode.isNull()) {
                    try {
                        LocalDateTime startedAt = LocalDateTime.parse(startedNode.asText());
                        long durationMs = Duration.between(startedAt, LocalDateTime.now()).toMillis();
                        sets.add(new JsonSetPair(base + ".durationMs", String.valueOf(durationMs), "int"));
                    } catch (Exception ignored) {
                        sets.add(new JsonSetPair(base + ".durationMs", null, "null"));
                    }
                } else {
                    sets.add(new JsonSetPair(base + ".durationMs", null, "null"));
                }
            }

            reviewRecordMapper.updateProgressJsonFields(recordId, sets);
            reviewRecordMapper.incrementCompletedDimensions(recordId, 1);
        } catch (Exception e) {
            log.error("[ReviewProgress] dimensionDone 异常 recordId={} agent={}", recordId, result.getAgentName(), e);
        }
    }

    /** 裁决开始：置 judge.status=RUNNING + 写 judge.startedAt */
    public void judgeStarted(Long recordId) {
        try {
            List<JsonSetPair> sets = new ArrayList<>();
            sets.add(new JsonSetPair("$.stage", "JUDGE_PHASE", "string"));
            sets.add(new JsonSetPair("$.judge.status", "RUNNING", "string"));
            sets.add(new JsonSetPair("$.judge.startedAt", LocalDateTime.now().toString(), "string"));
            reviewRecordMapper.updateProgressJsonFields(recordId, sets);
        } catch (Exception e) {
            log.error("[ReviewProgress] judgeStarted 异常 recordId={}", recordId, e);
        }
    }

    /** 裁决完成：JSON_SET 更新 judge 节点 */
    public void judgeDone(Long recordId, AgentResult judgeResult) {
        try {
            String now = LocalDateTime.now().toString();
            List<JsonSetPair> sets = new ArrayList<>();
            sets.add(new JsonSetPair("$.judge.status", "DONE", "string"));
            sets.add(new JsonSetPair("$.judge.verdict", judgeResult.getVerdict(), "string"));
            sets.add(new JsonSetPair("$.judge.confidence", String.valueOf(judgeResult.getConfidence()), "int"));
            if (judgeResult.getReason() != null) {
                sets.add(new JsonSetPair("$.judge.reason", judgeResult.getReason(), "string"));
            } else {
                sets.add(new JsonSetPair("$.judge.reason", null, "null"));
            }
            sets.add(new JsonSetPair("$.judge.finishedAt", now, "string"));

            // durationMs 需读 startedAt
            TrackReviewRecord r = reviewRecordMapper.selectById(recordId);
            if (r != null && r.getProgressJson() != null) {
                JsonNode root = objectMapper.readTree(r.getProgressJson());
                JsonNode startedNode = root.path("judge").path("startedAt");
                if (startedNode != null && !startedNode.isNull() && !startedNode.isMissingNode()) {
                    try {
                        LocalDateTime startedAt = LocalDateTime.parse(startedNode.asText());
                        long durationMs = Duration.between(startedAt, LocalDateTime.now()).toMillis();
                        sets.add(new JsonSetPair("$.judge.durationMs", String.valueOf(durationMs), "int"));
                    } catch (Exception ignored) {
                        sets.add(new JsonSetPair("$.judge.durationMs", null, "null"));
                    }
                } else {
                    sets.add(new JsonSetPair("$.judge.durationMs", null, "null"));
                }
            }

            reviewRecordMapper.updateProgressJsonFields(recordId, sets);
        } catch (Exception e) {
            log.error("[ReviewProgress] judgeDone 异常 recordId={}", recordId, e);
        }
    }

    /** 流水线完结：写 stage=FINISHED + finishedAt + finalStatus + finalVerdict + finalConfidence */
    public void finished(Long recordId, Integer finalStatus, Integer finalVerdict, Integer finalConfidence) {
        try {
            List<JsonSetPair> sets = new ArrayList<>();
            sets.add(new JsonSetPair("$.stage", "FINISHED", "string"));
            sets.add(new JsonSetPair("$.finishedAt", LocalDateTime.now().toString(), "string"));
            if (finalStatus != null) {
                sets.add(new JsonSetPair("$.finalStatus", String.valueOf(finalStatus), "int"));
            } else {
                sets.add(new JsonSetPair("$.finalStatus", null, "null"));
            }
            if (finalVerdict != null) {
                sets.add(new JsonSetPair("$.finalVerdict", String.valueOf(finalVerdict), "int"));
            } else {
                sets.add(new JsonSetPair("$.finalVerdict", null, "null"));
            }
            if (finalConfidence != null) {
                sets.add(new JsonSetPair("$.finalConfidence", String.valueOf(finalConfidence), "int"));
            } else {
                sets.add(new JsonSetPair("$.finalConfidence", null, "null"));
            }
            reviewRecordMapper.updateProgressJsonFields(recordId, sets);
        } catch (Exception e) {
            log.error("[ReviewProgress] finished 异常 recordId={}", recordId, e);
        }
    }

    /** 读取当前快照，progress_json 为 null 时返回 null */
    public ReviewProgressVO snapshot(Long recordId) {
        TrackReviewRecord r = reviewRecordMapper.selectById(recordId);
        if (r == null || r.getProgressJson() == null) return null;
        try {
            return objectMapper.readValue(r.getProgressJson(), ReviewProgressVO.class);
        } catch (Exception e) {
            log.warn("[ReviewProgress] snapshot 反序列化失败 recordId={}", recordId, e);
            return null;
        }
    }

    // ---------- 内部工具 ----------

    /**
     * 查找指定 agentName 在 dimensions 数组中的索引。
     * 读取一次 progress_json 做查找，不做修改。
     * 返回 -1 表示未找到（异常已 log，不抛）。
     */
    private int findDimensionIndex(Long recordId, String agentName) {
        try {
            TrackReviewRecord r = reviewRecordMapper.selectById(recordId);
            if (r == null || r.getProgressJson() == null) {
                log.warn("[ReviewProgress] findDimensionIndex: progressJson 为 null recordId={}", recordId);
                return -1;
            }
            JsonNode root = objectMapper.readTree(r.getProgressJson());
            JsonNode dims = root.get("dimensions");
            if (dims == null || !dims.isArray()) return -1;
            for (int i = 0; i < dims.size(); i++) {
                JsonNode d = dims.get(i);
                if (d.get("agentName").asText().equals(agentName)) {
                    return i;
                }
            }
            log.warn("[ReviewProgress] findDimensionIndex 未找到 agentName={} recordId={}", agentName, recordId);
            return -1;
        } catch (Exception e) {
            log.error("[ReviewProgress] findDimensionIndex 异常 recordId={} agent={}", recordId, agentName, e);
            return -1;
        }
    }

    private void writeJson(Long recordId, String json) {
        com.baomidou.mybatisplus.core.conditions.update.LambdaUpdateWrapper<TrackReviewRecord> wrapper =
            new com.baomidou.mybatisplus.core.conditions.update.LambdaUpdateWrapper<TrackReviewRecord>()
                .eq(TrackReviewRecord::getId, recordId)
                .set(TrackReviewRecord::getProgressJson, json);
        reviewRecordMapper.update(null, wrapper);
    }

    private String agentNameOf(DimensionAgent agent) {
        try {
            return agent.getName();
        } catch (Exception ignored) {
            return agent.getClass().getSimpleName();
        }
    }

    private int orderOf(DimensionAgent agent) {
        Order order = agent.getClass().getAnnotation(Order.class);
        return order != null ? order.value() : Integer.MAX_VALUE;
    }
}
