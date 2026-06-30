package com.son.auramix.ai.progress;

import com.baomidou.mybatisplus.core.conditions.update.LambdaUpdateWrapper;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.son.auramix.ai.agent.DimensionAgent;
import com.son.auramix.ai.dto.AgentResult;
import com.son.auramix.domain.entity.TrackReviewRecord;
import com.son.auramix.mapper.TrackReviewRecordMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import java.util.function.Consumer;

/**
 * 封装 progress_json 的 read-modify-write：
 * <ul>
 *   <li>{@link #initProgress} 写骨架</li>
 *   <li>{@link #dimensionDone} / {@link #judgeDone} / {@link #finished} 增量更新</li>
 *   <li>{@link #snapshot} 读取并反序列化为 VO</li>
 * </ul>
 * <p>
 * 所有写库异常在内部 try-catch 吞掉记 log，不抛出，不影响主流程（spec 6.5）。
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class ReviewProgressStore {

    private final TrackReviewRecordMapper reviewRecordMapper;
    private final ObjectMapper objectMapper;

    /** 维度名 → 中文显示名；与 ProgressEvent 中映射保持一致 */
    private static final java.util.Map<String, String> DISPLAY_NAMES = java.util.Map.of(
        "PoliticalSensitivity", "政治敏感",
        "ViolenceTerror", "暴力恐怖",
        "ExplicitContent", "色情低俗",
        "AntiSocial", "反社会"
    );

    /** 初始化骨架：4 维度 PENDING + judge PENDING + startedAt */
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

    /** 单维度开始执行：置 RUNNING + 写 startedAt（修复 durationMs 永远 null 的 bug） */
    public void dimensionStarted(Long recordId, String agentName) {
        update(recordId, root -> {
            JsonNode dims = root.get("dimensions");
            if (dims == null || !dims.isArray()) return;
            for (int i = 0; i < dims.size(); i++) {
                JsonNode d = dims.get(i);
                if (d.get("agentName").asText().equals(agentName)) {
                    ObjectNode dim = (ObjectNode) d;
                    dim.put("status", "RUNNING");
                    dim.put("startedAt", LocalDateTime.now().toString());
                    return;
                }
            }
            log.warn("[ReviewProgress] dimensionStarted 未找到 agentName={} recordId={}", agentName, recordId);
        });
    }

    /** 单维度完成：更新对应 agentName 的维度节点 + completedDimensions +1 */
    public void dimensionDone(Long recordId, AgentResult result) {
        update(recordId, root -> {
            JsonNode dims = root.get("dimensions");
            if (dims == null || !dims.isArray()) return;
            for (int i = 0; i < dims.size(); i++) {
                JsonNode d = dims.get(i);
                if (d.get("agentName").asText().equals(result.getAgentName())) {
                    ObjectNode dim = (ObjectNode) d;
                    String status = result.isFail() ? "FAIL" : "DONE";
                    dim.put("status", status);
                    dim.put("verdict", result.getVerdict());
                    dim.put("confidence", result.getConfidence());
                    if (result.getReason() != null) {
                        dim.put("reason", result.getReason());
                    } else {
                        dim.putNull("reason");
                    }
                    LocalDateTime finishedAt = LocalDateTime.now();
                    dim.put("finishedAt", finishedAt.toString());
                    JsonNode startedNode = dim.get("startedAt");
                    if (startedNode != null && !startedNode.isNull()) {
                        try {
                            LocalDateTime startedAt = LocalDateTime.parse(startedNode.asText());
                            dim.put("durationMs", Duration.between(startedAt, finishedAt).toMillis());
                        } catch (Exception ignored) {
                            dim.putNull("durationMs");
                        }
                    } else {
                        dim.putNull("durationMs");
                    }
                    // 维护总进度计数
                    ObjectNode rootObj = (ObjectNode) root;
                    JsonNode compNode = rootObj.get("completedDimensions");
                    int cur = (compNode != null && !compNode.isNull()) ? compNode.asInt() : 0;
                    rootObj.put("completedDimensions", cur + 1);
                    return;
                }
            }
            log.warn("[ReviewProgress] dimensionDone 未找到 agentName={} recordId={}",
                result.getAgentName(), recordId);
        });
    }

    /** 裁决开始：置 judge.status=RUNNING + 写 judge.startedAt */
    public void judgeStarted(Long recordId) {
        update(recordId, root -> {
            ObjectNode rootObj = (ObjectNode) root;
            rootObj.put("stage", "JUDGE_PHASE");
            ObjectNode judge = (ObjectNode) rootObj.get("judge");
            if (judge == null) {
                judge = objectMapper.createObjectNode();
                rootObj.set("judge", judge);
            }
            judge.put("status", "RUNNING");
            judge.put("startedAt", LocalDateTime.now().toString());
        });
    }

    /** 裁决完成：更新 judge 节点 */
    public void judgeDone(Long recordId, AgentResult judgeResult) {
        update(recordId, root -> {
            ObjectNode rootObj = (ObjectNode) root;
            ObjectNode judge = (ObjectNode) rootObj.get("judge");
            if (judge == null) {
                judge = objectMapper.createObjectNode();
                rootObj.set("judge", judge);
            }
            judge.put("status", "DONE");
            judge.put("verdict", judgeResult.getVerdict());
            judge.put("confidence", judgeResult.getConfidence());
            if (judgeResult.getReason() != null) {
                judge.put("reason", judgeResult.getReason());
            } else {
                judge.putNull("reason");
            }
            LocalDateTime finishedAt = LocalDateTime.now();
            judge.put("finishedAt", finishedAt.toString());
            JsonNode startedNode = judge.get("startedAt");
            if (startedNode != null && !startedNode.isNull()) {
                try {
                    LocalDateTime startedAt = LocalDateTime.parse(startedNode.asText());
                    judge.put("durationMs", Duration.between(startedAt, finishedAt).toMillis());
                } catch (Exception ignored) {
                    judge.putNull("durationMs");
                }
            } else {
                judge.putNull("durationMs");
            }
        });
    }

    /** 流水线完结：写 stage=FINISHED + finishedAt + finalStatus + finalVerdict + finalConfidence */
    public void finished(Long recordId, Integer finalStatus, Integer finalVerdict, Integer finalConfidence) {
        update(recordId, root -> {
            ObjectNode o = (ObjectNode) root;
            o.put("stage", "FINISHED");
            o.put("finishedAt", LocalDateTime.now().toString());
            if (finalStatus != null) o.put("finalStatus", finalStatus); else o.putNull("finalStatus");
            if (finalVerdict != null) o.put("finalVerdict", finalVerdict); else o.putNull("finalVerdict");
            if (finalConfidence != null) o.put("finalConfidence", finalConfidence); else o.putNull("finalConfidence");
        });
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

    // ---------- 通用 read-modify-write ----------

    /**
     * 通用更新：读 progress_json → mutator 修改 JsonNode → 写回 DB。
     * progress_json 为 null 时直接 return（防御性，不应发生但兜底）。
     * 异常吞掉记 log，不抛。
     */
    public void update(Long recordId, Consumer<JsonNode> mutator) {
        try {
            TrackReviewRecord r = reviewRecordMapper.selectById(recordId);
            if (r == null || r.getProgressJson() == null) {
                log.warn("[ReviewProgress] update 跳过：progressJson 为 null recordId={}", recordId);
                return;
            }
            JsonNode root = objectMapper.readTree(r.getProgressJson());
            mutator.accept(root);
            writeJson(recordId, objectMapper.writeValueAsString(root));
        } catch (Exception e) {
            log.error("[ReviewProgress] update 异常 recordId={}", recordId, e);
        }
    }

    private void writeJson(Long recordId, String json) {
        reviewRecordMapper.update(null,
            new LambdaUpdateWrapper<TrackReviewRecord>()
                .eq(TrackReviewRecord::getId, recordId)
                .set(TrackReviewRecord::getProgressJson, json));
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
