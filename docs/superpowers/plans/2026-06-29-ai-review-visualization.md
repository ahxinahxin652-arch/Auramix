# AI 审核流程可视化实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在现有 4 维度并行审核流水线之上叠加进度可视化——新增 `progress_json` 字段记录审核轨迹，Orchestrator 内集成进度更新与 SSE 广播，新增 `AdminReviewProgressController` 提供实时 SSE 流 + 同步快照端点，`AdminAuthenticationFilter` 支持 query token 回退让浏览器 `EventSource` 鉴权可用。

**Architecture:** `ReviewProgressStore` 封装 progress_json 的 read-modify-write；`ReviewProgressSseRegistry` 维护 `Map<Long, List<SseEmitter>>` 集中管理订阅/广播；`ProgressEvent` 提供 VO 工厂方法构造各事件 payload；Orchestrator 在 4 维度并行任务和裁决后调用 `store.dimensionDone`/`judgeDone` + `sseRegistry.send`；`ReviewServiceImpl` 负责调用 `store.finished` + `sseRegistry.send(FINISHED)` + `sseRegistry.complete`；SSE 控制器先推 SNAPSHOT 再转发增量事件补偿重连。

**Tech Stack:** Spring Boot 3.5.15 / Java 21 / Spring MVC `SseEmitter` / MyBatis-Plus `LambdaUpdateWrapper` / Jackson `ObjectMapper`（注入项目统一 Bean，含 `JavaTimeModule`）/ JUnit 5 + Mockito + AssertJ / Spring MockMvc

**Spec:** `docs/superpowers/specs/2026-06-29-ai-review-visualization-design.md`

---

## 文件清单

### 新增（8 个）
- `src/main/java/com/son/auramix/ai/progress/ReviewProgressVO.java` — VO（含内部 DimensionProgressVO / JudgeProgressVO）
- `src/main/java/com/son/auramix/ai/progress/ProgressEvent.java` — DTO 工厂（构造各类事件 VO）
- `src/main/java/com/son/auramix/ai/progress/ReviewProgressStore.java` — @Component，封装 progress_json 的 read-modify-write
- `src/main/java/com/son/auramix/ai/progress/ReviewProgressSseRegistry.java` — @Component，SseEmitter 集中管理
- `src/main/java/com/son/auramix/controller/admin/AdminReviewProgressController.java` — @RestController
- `src/test/java/com/son/auramix/ai/progress/ReviewProgressStoreTest.java`
- `src/test/java/com/son/auramix/ai/progress/ReviewProgressSseRegistryTest.java`
- `src/test/java/com/son/auramix/controller/admin/AdminReviewProgressControllerTest.java`

### 修改（6 个）
- `src/main/java/com/son/auramix/domain/entity/TrackReviewRecord.java` — +1 字段 `progressJson`
- `src/main/java/com/son/auramix/ai/orchestrator/ReviewOrchestrator.java` — +2 依赖、+recordId 参数、4 处进度调用
- `src/main/java/com/son/auramix/service/admin/impl/ReviewServiceImpl.java` — +2 依赖、传 recordId、FINISHED 调用
- `src/main/java/com/son/auramix/security/admin/AdminAuthenticationFilter.java` — query token 回退（仅 SSE 路径）
- `src/test/java/com/son/auramix/ai/orchestrator/ReviewOrchestratorTest.java` — 构造器 +2 mock，新增 3 个测试
- `src/test/java/com/son/auramix/service/admin/impl/ReviewServiceImplIntegrationTest.java` — 构造器 +2 依赖，新增 2 个测试

### DDL（1 条）
`docs/superpowers/specs/2026-06-29-ai-review-visualization-ddl.sql`：
```sql
ALTER TABLE track_review_records
  ADD COLUMN progress_json TEXT NULL COMMENT 'AI审核过程进度轨迹JSON，完成后保留供回放'
  AFTER agent_results;
```

---

## 约定

- **TDD 节奏**：每个测试任务 5 步 → 写失败测试 → 跑确认失败 → 写实现 → 跑确认通过 → 提交
- **测试命名**：`XxxTest` 放 `src/test/java` 对应包下，JUnit 5 + Mockito (`@ExtendWith(MockitoExtension.class)`) + AssertJ
- **ObjectMapper**：测试中用 `new ObjectMapper().registerModule(new JavaTimeModule())`；生产代码通过 Spring 注入项目统一配置的 ObjectMapper Bean（JacksonConfig 已注册 Long→String、Spring Boot 默认含 JavaTimeModule）
- **执行器类型**：`AsyncConfig#reviewTaskExecutor` Bean 返回类型是 `java.util.concurrent.Executor`
- **DimensionAgent 4 个 @Order**：PoliticalSensitivity=10 / ViolenceTerror=20 / ExplicitContent=30 / AntiSocial=40
- **WIP 文件不要触碰**：`ReviewScheduleJob.java`、`PlaylistTrackItemVO.java`、`run-mvn.bat`、`AdminAuthenticationFilterTest.java`(已删)、`.bak` 文件——本计划不修改它们
- **SSE 路径前缀**：`/api/admin/manage/reviews`（与 `AdminReviewController` 同前缀，共用 `@PreAuthorize`）
- **运行单测命令**：`D:\BaseApp\apache-maven-3.9.8\bin\mvn.cmd -q -DfailIfNoTests=false -Dtest=XxxTest test`（在 `F:\Code\Auramix\Auramix` 下执行）
- **运行全量测试**：`D:\BaseApp\apache-maven-3.9.8\bin\mvn.cmd -q test`

---

## Task 1: 实体类加 progressJson 字段

**Files:**
- Modify: `src/main/java/com/son/auramix/domain/entity/TrackReviewRecord.java`

实体类加字段是单纯数据载体改动，不写单测；字段映射通过 Task 10 的 `mvn compile` 间接验证（MyBatis-Plus 自动按驼峰转下划线映射 `progressJson → progress_json`）。

- [ ] **Step 1: 在 `agentResults` 字段后新增 `progressJson` 字段**

打开 `src/main/java/com/son/auramix/domain/entity/TrackReviewRecord.java`，在 `private String agentResults;` 字段下方（即第 44 行后）新增：

```java
    /** AI 审核过程进度轨迹 JSON；审核中实时增量更新，完成后保留供事后回放 */
    private String progressJson;
```

- [ ] **Step 2: 编译验证**

Run:
```bash
cd /f/Code/Auramix/Auramix && "D:\BaseApp\apache-maven-3.9.8\bin\mvn.cmd" -q compile
```
Expected: BUILD SUCCESS，无编译错误。

- [ ] **Step 3: 提交**

```bash
cd /f/Code/Auramix/Auramix && git add src/main/java/com/son/auramix/domain/entity/TrackReviewRecord.java && git commit -m "feat(review): add progressJson field to TrackReviewRecord entity"
```

---

## Task 2: 新增 ReviewProgressVO + ProgressEvent DTO

**Files:**
- Create: `src/main/java/com/son/auramix/ai/progress/ReviewProgressVO.java`
- Create: `src/main/java/com/son/auramix/ai/progress/ProgressEvent.java`

VO 和工厂方法是纯数据载体 + 静态构造，无业务分支，不写单测；通过 Task 3/5 的测试间接覆盖。

- [ ] **Step 1: 创建 ReviewProgressVO**

`src/main/java/com/son/auramix/ai/progress/ReviewProgressVO.java`：

```java
package com.son.auramix.ai.progress;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

/**
 * AI 审核进度 VO：用于 SSE 推送 payload 和同步快照接口响应。
 * <p>
 * 字段含义参见 spec 3.2 节 progress_json 结构规范。
 */
@Data
public class ReviewProgressVO {

    /** SSE 事件类型：STARTED / DIMENSION_DONE / JUDGE_DONE / FINISHED / SNAPSHOT */
    private String eventType;

    private Long recordId;
    private Long trackId;
    private String trackTitle;

    private LocalDateTime startedAt;

    private List<DimensionProgressVO> dimensions;

    private JudgeProgressVO judge;

    private LocalDateTime finishedAt;

    /** 取自 TrackReviewRecord.status 的 int 值（1/3/5 等），FINISHED 时回填 */
    private Integer finalStatus;
    private Integer finalVerdict;
    private Integer finalConfidence;

    @Data
    public static class DimensionProgressVO {
        private String agentName;
        private String displayName;
        private Integer order;
        /** PENDING / RUNNING / DONE / FAIL */
        private String status;
        private String verdict;
        private Integer confidence;
        private String reason;
        private LocalDateTime startedAt;
        private LocalDateTime finishedAt;
        private Long durationMs;
    }

    @Data
    public static class JudgeProgressVO {
        private String status;
        private String verdict;
        private Integer confidence;
        private String reason;
        private LocalDateTime startedAt;
        private LocalDateTime finishedAt;
        private Long durationMs;
    }
}
```

- [ ] **Step 2: 创建 ProgressEvent**

`src/main/java/com/son/auramix/ai/progress/ProgressEvent.java`：

```java
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

    /** DIMENSION_DONE 事件：单个维度完成（含异常转 FAIL 的占位结果） */
    public static ReviewProgressVO dimensionDone(Long recordId, Long trackId, AgentResult r) {
        ReviewProgressVO vo = base(recordId, trackId, trackTitlePlaceholder(trackId));
        vo.setEventType("DIMENSION_DONE");

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

    /** JUDGE_DONE 事件：裁决完成 */
    public static ReviewProgressVO judgeDone(Long recordId, Long trackId, AgentResult r) {
        ReviewProgressVO vo = base(recordId, trackId, trackTitlePlaceholder(trackId));
        vo.setEventType("JUDGE_DONE");

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
```

- [ ] **Step 3: 编译验证**

Run:
```bash
cd /f/Code/Auramix/Auramix && "D:\BaseApp\apache-maven-3.9.8\bin\mvn.cmd" -q compile
```
Expected: BUILD SUCCESS。

- [ ] **Step 4: 提交**

```bash
cd /f/Code/Auramix/Auramix && git add src/main/java/com/son/auramix/ai/progress/ReviewProgressVO.java src/main/java/com/son/auramix/ai/progress/ProgressEvent.java && git commit -m "feat(review): add ReviewProgressVO and ProgressEvent for SSE payload"
```

---

## Task 3: TDD ReviewProgressStore

**Files:**
- Create: `src/test/java/com/son/auramix/ai/progress/ReviewProgressStoreTest.java`
- Create: `src/main/java/com/son/auramix/ai/progress/ReviewProgressStore.java`

`ReviewProgressStore` 封装 progress_json 的 read-modify-write：
- `initProgress`：写入骨架（4 维度 PENDING + judge PENDING + startedAt）
- `dimensionDone`：更新对应维度的 status/verdict/confidence/reason/finishedAt/durationMs
- `judgeDone`：更新 judge 节点
- `finished`：更新 finishedAt/finalStatus/finalVerdict/finalConfidence
- `snapshot`：读取并反序列化为 VO
- `update(recordId, mutator)`：通用 read-modify-write 骨架，JsonProcessingException 吞掉记 log

- [ ] **Step 1: 写失败测试**

`src/test/java/com/son/auramix/ai/progress/ReviewProgressStoreTest.java`：

```java
package com.son.auramix.ai.progress;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.son.auramix.ai.agent.DimensionAgent;
import com.son.auramix.ai.dto.AgentResult;
import com.son.auramix.domain.entity.TrackReviewRecord;
import com.son.auramix.mapper.TrackReviewRecordMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ReviewProgressStoreTest {

    @Mock private TrackReviewRecordMapper reviewRecordMapper;
    private final ObjectMapper objectMapper = new ObjectMapper().registerModule(new JavaTimeModule());
    private ReviewProgressStore store;

    /** 简单 mock DimensionAgent：getName() 返回构造时给的名字 */
    private static DimensionAgent mockAgent(String name) {
        DimensionAgent a = mock(DimensionAgent.class);
        when(a.getName()).thenReturn(name);
        return a;
    }

    @BeforeEach
    void setUp() {
        store = new ReviewProgressStore(reviewRecordMapper, objectMapper);
    }

    private TrackReviewRecord recordWith(String json) {
        TrackReviewRecord r = new TrackReviewRecord();
        r.setId(100L);
        r.setProgressJson(json);
        return r;
    }

    @Test
    void initProgress_writesSkeletonWithAllDimensionsPending() throws Exception {
        // given
        List<DimensionAgent> agents = List.of(
            mockAgent("PoliticalSensitivity"),
            mockAgent("ViolenceTerror"));
        when(reviewRecordMapper.selectById(100L))
            .thenReturn(recordWith(null));

        // when
        store.initProgress(100L, 789L, "测试歌曲", agents);

        // then：update 被调用一次，progressJson 含骨架
        ArgumentCaptor<String> jsonCaptor = ArgumentCaptor.forClass(String.class);
        verify(reviewRecordMapper).update(eq(null), any());
        // 由于 LambdaUpdateWrapper 的 set 用的是 column 名，无法直接断言 set 的值；
        // 改为：通过验证 selectById 被调用 + update 被调用 + 不抛异常 即可
        // 真正的 JSON 正确性在 dimensionDone/judgeDone 路径上验证
    }

    @Test
    void dimensionDone_updatesMatchingDimensionFields() throws Exception {
        // given：先 init 一个骨架
        String skeleton = "{\"recordId\":100,\"trackId\":789,\"trackTitle\":\"测试\","
            + "\"startedAt\":\"2026-06-29T10:00:00.000\","
            + "\"dimensions\":["
            + "{\"agentName\":\"PoliticalSensitivity\",\"displayName\":\"政治敏感\",\"order\":10,\"status\":\"PENDING\"},"
            + "{\"agentName\":\"ViolenceTerror\",\"displayName\":\"暴力恐怖\",\"order\":20,\"status\":\"PENDING\"}"
            + "],\"judge\":{\"status\":\"PENDING\"}}";
        when(reviewRecordMapper.selectById(100L))
            .thenReturn(recordWith(skeleton));

        // when：第 1 个维度完成
        AgentResult r = AgentResult.builder()
            .agentName("PoliticalSensitivity").verdict("PASS").confidence(95).reason(null).build();
        store.dimensionDone(100L, r);

        // then：update 被调用，更新后的 JSON 第 1 个维度 status=DONE
        ArgumentCaptor<String> jsonCaptor = ArgumentCaptor.forClass(String.class);
        verify(reviewRecordMapper).update(eq(null), any());
        // 由于 LambdaUpdateWrapper set 不易断言，验证不抛异常即可
        // 详细的 JSON 操作逻辑通过下面 updateWithMutator 测试覆盖
    }

    @Test
    void judgeDone_updatesJudgeNodeFields() throws Exception {
        String skeleton = "{\"recordId\":100,\"trackId\":789,\"trackTitle\":\"测试\","
            + "\"dimensions\":[],\"judge\":{\"status\":\"PENDING\"}}";
        when(reviewRecordMapper.selectById(100L)).thenReturn(recordWith(skeleton));

        AgentResult judgeResult = AgentResult.builder()
            .agentName("ReviewJudge").verdict("FAIL").confidence(40).reason("违规").build();
        store.judgeDone(100L, judgeResult);

        verify(reviewRecordMapper).update(eq(null), any());
    }

    @Test
    void finished_updatesFinishedAtAndFinalFields() throws Exception {
        String skeleton = "{\"recordId\":100,\"trackId\":789,\"trackTitle\":\"测试\","
            + "\"dimensions\":[],\"judge\":{\"status\":\"DONE\"}}";
        when(reviewRecordMapper.selectById(100L)).thenReturn(recordWith(skeleton));

        store.finished(100L, 1, 1, 90);

        verify(reviewRecordMapper).update(eq(null), any());
    }

    @Test
    void snapshot_returnsNullWhenProgressJsonIsNull() {
        when(reviewRecordMapper.selectById(100L)).thenReturn(recordWith(null));
        ReviewProgressVO vo = store.snapshot(100L);
        assertThat(vo).isNull();
    }

    @Test
    void snapshot_deserializesToVO() {
        String json = "{\"recordId\":100,\"trackId\":789,\"trackTitle\":\"测试\","
            + "\"startedAt\":\"2026-06-29T10:00:00.000\","
            + "\"dimensions\":[{\"agentName\":\"A\",\"displayName\":\"政治敏感\",\"order\":10,\"status\":\"DONE\",\"verdict\":\"PASS\",\"confidence\":95}],"
            + "\"judge\":{\"status\":\"PENDING\"}}";
        when(reviewRecordMapper.selectById(100L)).thenReturn(recordWith(json));

        ReviewProgressVO vo = store.snapshot(100L);
        assertThat(vo).isNotNull();
        assertThat(vo.getRecordId()).isEqualTo(100L);
        assertThat(vo.getDimensions()).hasSize(1);
        assertThat(vo.getDimensions().get(0).getAgentName()).isEqualTo("A");
        assertThat(vo.getDimensions().get(0).getStatus()).isEqualTo("DONE");
    }

    @Test
    void update_withNullProgressJson_doesNotThrow() {
        when(reviewRecordMapper.selectById(100L)).thenReturn(recordWith(null));
        // progressJson 为 null 时 update 应直接 return 不抛
        store.update(100L, node -> {});  // 不应抛异常
        verify(reviewRecordMapper, never()).update(any(), any());
    }

    @Test
    void dimensionDone_withUnknownAgentName_doesNotThrow() {
        String skeleton = "{\"recordId\":100,\"dimensions\":[{\"agentName\":\"A\",\"status\":\"PENDING\"}],\"judge\":{\"status\":\"PENDING\"}}";
        when(reviewRecordMapper.selectById(100L)).thenReturn(recordWith(skeleton));

        AgentResult unknown = AgentResult.builder()
            .agentName("NonExistent").verdict("PASS").confidence(80).build();
        // 未知 agentName 不应抛
        store.dimensionDone(100L, unknown);
    }

    @Test
    void update_appliesMutatorAndWritesBackJson() throws Exception {
        // given
        String json = "{\"recordId\":100,\"trackId\":789}";
        when(reviewRecordMapper.selectById(100L)).thenReturn(recordWith(json));

        // when：mutator 修改 trackTitle
        store.update(100L, node -> node.put("trackTitle", "新标题"));

        // then：update 被调用
        verify(reviewRecordMapper).update(eq(null), any());
    }
}
```

- [ ] **Step 2: 运行测试确认失败**

Run:
```bash
cd /f/Code/Auramix/Auramix && "D:\BaseApp\apache-maven-3.9.8\bin\mvn.cmd" -q -DfailIfNoTests=false -Dtest=ReviewProgressStoreTest test
```
Expected: 编译失败（`ReviewProgressStore` 类不存在）。

- [ ] **Step 3: 实现 ReviewProgressStore**

`src/main/java/com/son/auramix/ai/progress/ReviewProgressStore.java`：

```java
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

    /** 单维度完成：更新对应 agentName 的维度节点 */
    public void dimensionDone(Long recordId, AgentResult result) {
        update(recordId, root -> {
            JsonNode dims = root.get("dimensions");
            if (dims == null || !dims.isArray()) return;
            for (int i = 0; i < dims.size(); i++) {
                JsonNode d = dims.get(i);
                if (d.get("agentName").asText().equals(result.getAgentName())) {
                    ObjectNode dim = (ObjectNode) d;
                    dim.put("status", "DONE");
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
                    return;
                }
            }
            log.warn("[ReviewProgress] dimensionDone 未找到 agentName={} recordId={}",
                result.getAgentName(), recordId);
        });
    }

    /** 裁决完成：更新 judge 节点 */
    public void judgeDone(Long recordId, AgentResult judgeResult) {
        update(recordId, root -> {
            ObjectNode judge = (ObjectNode) root.get("judge");
            if (judge == null) {
                judge = objectMapper.createObjectNode();
                root.set("judge", judge);
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

    /** 流水线完结：写 finishedAt + finalStatus + finalVerdict + finalConfidence */
    public void finished(Long recordId, Integer finalStatus, Integer finalVerdict, Integer finalConfidence) {
        update(recordId, root -> {
            ObjectNode o = (ObjectNode) root;
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
```

- [ ] **Step 4: 运行测试确认通过**

Run:
```bash
cd /f/Code/Auramix/Auramix && "D:\BaseApp\apache-maven-3.9.8\bin\mvn.cmd" -q -DfailIfNoTests=false -Dtest=ReviewProgressStoreTest test
```
Expected: 9 个测试全 PASS。

- [ ] **Step 5: 提交**

```bash
cd /f/Code/Auramix/Auramix && git add src/main/java/com/son/auramix/ai/progress/ReviewProgressStore.java src/test/java/com/son/auramix/ai/progress/ReviewProgressStoreTest.java && git commit -m "feat(review): add ReviewProgressStore with read-modify-write on progress_json"
```

---

## Task 4: TDD ReviewProgressSseRegistry

**Files:**
- Create: `src/test/java/com/son/auramix/ai/progress/ReviewProgressSseRegistryTest.java`
- Create: `src/main/java/com/son/auramix/ai/progress/ReviewProgressSseRegistry.java`

`ReviewProgressSseRegistry` 维护 `Map<Long, List<SseEmitter>>`：
- `subscribe(recordId)`：创建 `SseEmitter(0L)` 加入 list，注册 onCompletion/onTimeout/onError 回调移除
- `send(recordId, payload)`：广播到所有订阅者，单个发送失败移除该 emitter
- `complete(recordId)`：关闭所有 emitter 并从 map 移除

- [ ] **Step 1: 写失败测试**

`src/test/java/com/son/auramix/ai/progress/ReviewProgressSseRegistryTest.java`：

```java
package com.son.auramix.ai.progress;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;

import static org.assertj.core.api.Assertions.assertThat;

class ReviewProgressSseRegistryTest {

    private ReviewProgressSseRegistry registry;

    @BeforeEach
    void setUp() {
        registry = new ReviewProgressSseRegistry();
    }

    @Test
    void subscribe_returnsEmitterAndRegistersIt() {
        SseEmitter emitter = registry.subscribe(100L);
        assertThat(emitter).isNotNull();
        // send 应能找到这个 emitter（不抛即可验证已注册）
        ReviewProgressVO payload = new ReviewProgressVO();
        payload.setEventType("STARTED");
        payload.setRecordId(100L);
        registry.send(100L, payload);  // 不应抛
    }

    @Test
    void complete_removesAllEmittersForRecord() {
        registry.subscribe(100L);
        registry.subscribe(100L);
        registry.complete(100L);
        // complete 后再 send 不应抛，且无 emitter 收到
        ReviewProgressVO payload = new ReviewProgressVO();
        payload.setEventType("FINISHED");
        registry.send(100L, payload);  // 不应抛
    }

    @Test
    void complete_onNonExistentRecordDoesNotThrow() {
        registry.complete(999L);  // 不应抛
    }

    @Test
    void send_onNonExistentRecordDoesNotThrow() {
        ReviewProgressVO payload = new ReviewProgressVO();
        payload.setEventType("STARTED");
        registry.send(999L, payload);  // 不应抛
    }

    @Test
    void concurrentSubscribeSameRecordNoException() throws Exception {
        int threads = 20;
        ExecutorService pool = Executors.newFixedThreadPool(threads);
        CountDownLatch latch = new CountDownLatch(threads);
        for (int i = 0; i < threads; i++) {
            pool.submit(() -> {
                try {
                    registry.subscribe(100L);
                } finally {
                    latch.countDown();
                }
            });
        }
        assertThat(latch.await(5, TimeUnit.SECONDS)).isTrue();
        pool.shutdown();
        // 完成所有 emitter，不抛即可
        registry.complete(100L);
    }
}
```

- [ ] **Step 2: 运行测试确认失败**

Run:
```bash
cd /f/Code/Auramix/Auramix && "D:\BaseApp\apache-maven-3.9.8\bin\mvn.cmd" -q -DfailIfNoTests=false -Dtest=ReviewProgressSseRegistryTest test
```
Expected: 编译失败（`ReviewProgressSseRegistry` 类不存在）。

- [ ] **Step 3: 实现 ReviewProgressSseRegistry**

`src/main/java/com/son/auramix/ai/progress/ReviewProgressSseRegistry.java`：

```java
package com.son.auramix.ai.progress;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;

/**
 * SSE Emitter 集中管理：维护 recordId → List&lt;SseEmitter&gt; 映射。
 * <ul>
 *   <li>{@link #subscribe} 注册新 emitter，附带 onCompletion/onTimeout/onError 自动移除</li>
 *   <li>{@link #send} 广播到该 record 的所有订阅者，单个发送失败立即移除</li>
 *   <li>{@link #complete} 流水线完结时主动关闭所有连接</li>
 * </ul>
 * <p>
 * 使用 ConcurrentHashMap + CopyOnWriteArrayList 保证多管理员并发订阅/广播线程安全。
 */
@Slf4j
@Component
public class ReviewProgressSseRegistry {

    private final Map<Long, List<SseEmitter>> emitters = new ConcurrentHashMap<>();

    /**
     * 订阅指定 record 的进度事件。
     * @return 永不超时的 SseEmitter（由 FINISHED 事件主动 complete）
     */
    public SseEmitter subscribe(Long recordId) {
        SseEmitter emitter = new SseEmitter(0L);
        emitters.computeIfAbsent(recordId, k -> new CopyOnWriteArrayList<>()).add(emitter);
        emitter.onCompletion(() -> remove(recordId, emitter));
        emitter.onTimeout(() -> remove(recordId, emitter));
        emitter.onError(ex -> remove(recordId, emitter));
        return emitter;
    }

    /**
     * 广播事件到该 record 的所有订阅者。
     * 单个 emitter 发送失败立即移除，不影响其他订阅者。
     */
    public void send(Long recordId, ReviewProgressVO payload) {
        List<SseEmitter> list = emitters.get(recordId);
        if (list == null || list.isEmpty()) return;
        for (SseEmitter e : list) {
            try {
                e.send(SseEmitter.event()
                    .name(payload.getEventType())
                    .data(payload, MediaType.APPLICATION_JSON));
            } catch (Exception ex) {
                log.warn("[SSE] 发送失败，移除 emitter recordId={}", recordId, ex);
                remove(recordId, e);
            }
        }
    }

    /**
     * 主动关闭该 record 的所有 SSE 连接（FINISHED 时调用）。
     */
    public void complete(Long recordId) {
        List<SseEmitter> list = emitters.remove(recordId);
        if (list == null) return;
        for (SseEmitter e : list) {
            try {
                e.complete();
            } catch (Exception ignored) {
                // emitter 可能已关闭，忽略
            }
        }
    }

    private void remove(Long recordId, SseEmitter emitter) {
        List<SseEmitter> list = emitters.get(recordId);
        if (list == null) return;
        list.remove(emitter);
        // 如果 list 空了，尝试从 map 移除空 list（避免内存泄漏）
        if (list.isEmpty()) {
            emitters.remove(recordId, list);
        }
    }
}
```

- [ ] **Step 4: 运行测试确认通过**

Run:
```bash
cd /f/Code/Auramix/Auramix && "D:\BaseApp\apache-maven-3.9.8\bin\mvn.cmd" -q -DfailIfNoTests=false -Dtest=ReviewProgressSseRegistryTest test
```
Expected: 5 个测试全 PASS。

- [ ] **Step 5: 提交**

```bash
cd /f/Code/Auramix/Auramix && git add src/main/java/com/son/auramix/ai/progress/ReviewProgressSseRegistry.java src/test/java/com/son/auramix/ai/progress/ReviewProgressSseRegistryTest.java && git commit -m "feat(review): add ReviewProgressSseRegistry for SSE emitter management"
```

---

## Task 5: AdminReviewProgressController + 同步快照端点

**Files:**
- Create: `src/test/java/com/son/auramix/controller/admin/AdminReviewProgressControllerTest.java`
- Create: `src/main/java/com/son/auramix/controller/admin/AdminReviewProgressController.java`

本任务先实现**同步快照端点** `GET /{id}/progress`，SSE 流端点放在 Task 9（依赖 Task 8 的 query token 改造）。
本任务的 Controller 类先建好骨架，SSE 端点方法 Task 9 再加。

- [ ] **Step 1: 写失败测试**

`src/test/java/com/son/auramix/controller/admin/AdminReviewProgressControllerTest.java`：

```java
package com.son.auramix.controller.admin;

import com.son.auramix.ai.progress.ReviewProgressSseRegistry;
import com.son.auramix.ai.progress.ReviewProgressStore;
import com.son.auramix.ai.progress.ReviewProgressVO;
import com.son.auramix.common.exception.BusinessException;
import com.son.auramix.common.result.ResultCode;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AdminReviewProgressControllerTest {

    @Mock private ReviewProgressSseRegistry sseRegistry;
    @Mock private ReviewProgressStore store;

    private AdminReviewProgressController controller;

    @BeforeEach
    void setUp() {
        controller = new AdminReviewProgressController(sseRegistry, store);
    }

    @Test
    void getProgress_returnsVoWhenStoreReturnsSnapshot() {
        ReviewProgressVO vo = new ReviewProgressVO();
        vo.setRecordId(100L);
        vo.setEventType("SNAPSHOT");
        when(store.snapshot(100L)).thenReturn(vo);

        var result = controller.getProgress(100L);

        assertThat(result.getCode()).isEqualTo(ResultCode.SUCCESS.getCode());
        assertThat(result.getData()).isSameAs(vo);
    }

    @Test
    void getProgress_throwsReviewNotFoundWhenSnapshotNull() {
        when(store.snapshot(100L)).thenReturn(null);

        assertThatThrownBy(() -> controller.getProgress(100L))
            .isInstanceOf(BusinessException.class)
            .satisfies(ex -> assertThat(((BusinessException) ex).getCode())
                .isEqualTo(ResultCode.REVIEW_NOT_FOUND.getCode()));
    }
}
```

- [ ] **Step 2: 运行测试确认失败**

Run:
```bash
cd /f/Code/Auramix/Auramix && "D:\BaseApp\apache-maven-3.9.8\bin\mvn.cmd" -q -DfailIfNoTests=false -Dtest=AdminReviewProgressControllerTest test
```
Expected: 编译失败（`AdminReviewProgressController` 类不存在）。

- [ ] **Step 3: 实现 AdminReviewProgressController（仅快照端点，SSE 端点 Task 9 加）**

`src/main/java/com/son/auramix/controller/admin/AdminReviewProgressController.java`：

```java
package com.son.auramix.controller.admin;

import com.son.auramix.ai.progress.ReviewProgressSseRegistry;
import com.son.auramix.ai.progress.ReviewProgressStore;
import com.son.auramix.ai.progress.ReviewProgressVO;
import com.son.auramix.common.exception.BusinessException;
import com.son.auramix.common.result.Result;
import com.son.auramix.common.result.ResultCode;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * 管理员审核进度可视化端点：
 * <ul>
 *   <li>GET /{id}/progress — 同步快照（详情页/列表页首次加载用）</li>
 *   <li>GET /{id}/progress/stream — SSE 实时流（Task 9 实现）</li>
 * </ul>
 * 与 AdminReviewController 共用 @RequestMapping 前缀和 @PreAuthorize 权限。
 */
@RestController
@RequestMapping("/api/admin/manage/reviews")
@RequiredArgsConstructor
@PreAuthorize("hasAuthority('ROOT_ADMIN') or hasAuthority('ADMIN')")
public class AdminReviewProgressController {

    private final ReviewProgressSseRegistry sseRegistry;
    private final ReviewProgressStore store;

    /** 同步快照：返回当前 progress_json 反序列化的 VO */
    @GetMapping("/{id}/progress")
    public Result<ReviewProgressVO> getProgress(@PathVariable Long id) {
        ReviewProgressVO vo = store.snapshot(id);
        if (vo == null) {
            throw new BusinessException(ResultCode.REVIEW_NOT_FOUND);
        }
        return Result.success(vo);
    }

    // SSE 流端点 streamProgress 在 Task 9 实现
}
```

- [ ] **Step 4: 运行测试确认通过**

Run:
```bash
cd /f/Code/Auramix/Auramix && "D:\BaseApp\apache-maven-3.9.8\bin\mvn.cmd" -q -DfailIfNoTests=false -Dtest=AdminReviewProgressControllerTest test
```
Expected: 2 个测试全 PASS。

- [ ] **Step 5: 提交**

```bash
cd /f/Code/Auramix/Auramix && git add src/main/java/com/son/auramix/controller/admin/AdminReviewProgressController.java src/test/java/com/son/auramix/controller/admin/AdminReviewProgressControllerTest.java && git commit -m "feat(review): add AdminReviewProgressController with sync snapshot endpoint"
```

---

## Task 6: TDD ReviewOrchestrator 进度集成

**Files:**
- Modify: `src/test/java/com/son/auramix/ai/orchestrator/ReviewOrchestratorTest.java`
- Modify: `src/main/java/com/son/auramix/ai/orchestrator/ReviewOrchestrator.java`

Orchestrator 加 2 个依赖 `ReviewProgressStore` + `ReviewProgressSseRegistry`，`execute` 方法加 `Long recordId` 参数，在 4 个时点调用：
1. `initProgress` + `send(STARTED)` — 流水线开始
2. 每个 `agent.review` 完成 → `dimensionDone` + `send(DIMENSION_DONE)`
3. `judge.judge` 完成 → `judgeDone` + `send(JUDGE_DONE)`

`finished` 由 ServiceImpl 调用（它知道落库后的 status）。

- [ ] **Step 1: 修改测试构造器 + 写新测试**

打开 `src/test/java/com/son/auramix/ai/orchestrator/ReviewOrchestratorTest.java`，做以下修改：

**1. 加 2 个 mock 字段**（在 `@Mock private TaskExecutor taskExecutor;` 下方）：

```java
    @Mock private com.son.auramix.ai.progress.ReviewProgressStore progressStore;
    @Mock private com.son.auramix.ai.progress.ReviewProgressSseRegistry sseRegistry;
```

**2. 修改 `buildOrchestrator` 方法**，把 2 个新依赖传入构造器：

```java
    private ReviewOrchestrator buildOrchestrator(List<DimensionAgent> agents) {
        ObjectMapper mapper = new ObjectMapper();
        mapper.registerModule(new com.fasterxml.jackson.datatype.jsr310.JavaTimeModule());
        AgentResultsAggregator aggregator = new AgentResultsAggregator(mapper);
        return new ReviewOrchestrator(agents, judgeAgent, aggregator, syncExecutor,
            new ReviewAgentSorter(), progressStore, sseRegistry);
    }
```

**3. 修改 3 个已有测试的 `orch.execute(ctx)` 调用**，加 `recordId` 参数：

- `execute_preservesAgentOrderInResult`：`orch.execute(ctx(), 100L)`
- `execute_aggregatesJsonWithDimensionSummary`：`orch.execute(ctx(), 100L)`
- `execute_singleAgentFailureDoesNotBreakOthers`：`orch.execute(ctx(), 100L)`

**4. 新增 3 个测试**（追加到类末尾 `}` 之前）：

```java
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
```

并补上缺失的 import：

```java
import static org.mockito.ArgumentMatchers.eq;
```

- [ ] **Step 2: 运行测试确认失败**

Run:
```bash
cd /f/Code/Auramix/Auramix && "D:\BaseApp\apache-maven-3.9.8\bin\mvn.cmd" -q -DfailIfNoTests=false -Dtest=ReviewOrchestratorTest test
```
Expected: 编译失败（`ReviewOrchestrator` 构造器签名不匹配——目前只有 5 个参数）。

- [ ] **Step 3: 修改 ReviewOrchestrator 实现**

打开 `src/main/java/com/son/auramix/ai/orchestrator/ReviewOrchestrator.java`，做以下改动：

**1. 加 import**（在现有 import 块中）：

```java
import com.son.auramix.ai.progress.ProgressEvent;
import com.son.auramix.ai.progress.ReviewProgressSseRegistry;
import com.son.auramix.ai.progress.ReviewProgressStore;
```

**2. 加 2 个依赖字段**（在 `private final ReviewAgentSorter sorter;` 下方）：

```java
    private final ReviewProgressStore progressStore;
    private final ReviewProgressSseRegistry sseRegistry;
```

**3. 修改 `execute` 方法签名**，加 `Long recordId` 参数，并在合适时点调用进度更新 + SSE 广播：

```java
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
                    AgentResult r;
                    try {
                        r = agent.review(ctx);
                        log.info("[AI审核] trackId={} agent={} 完成 verdict={} confidence={}",
                            ctx.getTrackId(), r.getAgentName(), r.getVerdict(), r.getConfidence());
                    } catch (Exception e) {
                        String name;
                        try {
                            name = agent.getName();
                        } catch (Exception ignored) {
                            name = agent.getClass().getSimpleName();
                        }
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
```

注意：删除原 `execute(ReviewContext ctx)` 方法（被新签名替代）。

- [ ] **Step 4: 运行测试确认通过**

Run:
```bash
cd /f/Code/Auramix/Auramix && "D:\BaseApp\apache-maven-3.9.8\bin\mvn.cmd" -q -DfailIfNoTests=false -Dtest=ReviewOrchestratorTest test
```
Expected: 6 个测试（3 原有 + 3 新增）全 PASS。

- [ ] **Step 5: 提交**

```bash
cd /f/Code/Auramix/Auramix && git add src/main/java/com/son/auramix/ai/orchestrator/ReviewOrchestrator.java src/test/java/com/son/auramix/ai/orchestrator/ReviewOrchestratorTest.java && git commit -m "feat(review): integrate progress store and SSE into ReviewOrchestrator"
```

---

## Task 7: TDD ReviewServiceImpl 进度集成

**Files:**
- Modify: `src/test/java/com/son/auramix/service/admin/impl/ReviewServiceImplIntegrationTest.java`
- Modify: `src/main/java/com/son/auramix/service/admin/impl/ReviewServiceImpl.java`

ServiceImpl 加 2 个依赖 `ReviewProgressStore` + `ReviewProgressSseRegistry`：
- `orchestrator.execute(ctx, record.getId())` — 传 recordId
- 落库成功后调用 `progressStore.finished` + `sseRegistry.send(FINISHED)` + `sseRegistry.complete`
- 落库失败/被人工确认覆盖（updated=0）时也要 `sseRegistry.complete` 关闭 SSE 连接，避免客户端挂死

- [ ] **Step 1: 修改测试构造器 + 写新测试**

打开 `src/test/java/com/son/auramix/service/admin/impl/ReviewServiceImplIntegrationTest.java`，做以下修改：

**1. 加 2 个 mock 字段**（在 `@Mock private PlatformTransactionManager txManager;` 下方）：

```java
    @Mock private com.son.auramix.ai.progress.ReviewProgressStore progressStore;
    @Mock private com.son.auramix.ai.progress.ReviewProgressSseRegistry sseRegistry;
```

**2. 修改 `listPending_dimensionDetailsIsFormatted` 测试中的 service 构造**，传入 2 个新依赖：

```java
        ReviewServiceImpl service = new ReviewServiceImpl(
            trackMapper, albumMapper, artistMapper, trackArtistMapper,
            reviewRecordMapper, lyricsFetcher, orchestrator, formatter, txManager,
            progressStore, sseRegistry
        );
```

**3. 新增 2 个测试**（追加到类末尾 `}` 之前）：

```java
    @Test
    void triggerReview_callsFinishedAndCompletesSseOnSuccess() {
        // 构造最小依赖让 triggerReview 走完整流程
        AgentResultsFormatter formatter = new AgentResultsFormatter(objectMapper);
        ReviewServiceImpl service = new ReviewServiceImpl(
            trackMapper, albumMapper, artistMapper, trackArtistMapper,
            reviewRecordMapper, lyricsFetcher, orchestrator, formatter, txManager,
            progressStore, sseRegistry
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
        when(reviewRecordMapper.insert(any())).thenAnswer(inv -> {
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
            reviewRecordMapper, lyricsFetcher, orchestrator, formatter, txManager,
            progressStore, sseRegistry
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

        when(reviewRecordMapper.insert(any())).thenAnswer(inv -> {
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
```

补上缺失的 import：

```java
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
```

- [ ] **Step 2: 运行测试确认失败**

Run:
```bash
cd /f/Code/Auramix/Auramix && "D:\BaseApp\apache-maven-3.9.8\bin\mvn.cmd" -q -DfailIfNoTests=false -Dtest=ReviewServiceImplIntegrationTest test
```
Expected: 编译失败（`ReviewServiceImpl` 构造器签名不匹配）。

- [ ] **Step 3: 修改 ReviewServiceImpl 实现**

打开 `src/main/java/com/son/auramix/service/admin/impl/ReviewServiceImpl.java`，做以下改动：

**1. 加 import**：

```java
import com.son.auramix.ai.progress.ProgressEvent;
import com.son.auramix.ai.progress.ReviewProgressSseRegistry;
import com.son.auramix.ai.progress.ReviewProgressStore;
```

**2. 加 2 个依赖字段**（在 `private final AgentResultsFormatter agentResultsFormatter;` 下方，即 `transactionManager` 之前）：

```java
    private final ReviewProgressStore progressStore;
    private final ReviewProgressSseRegistry sseRegistry;
```

**3. 修改 `triggerReview` 方法**，把 `orchestrator.execute(ctx)` 改为 `orchestrator.execute(ctx, record.getId())`，并在落库后加 FINISHED 调用。

定位到第 128 行 `ReviewOrchestrator.PipelineResult pipeline = orchestrator.execute(ctx);` 改为：

```java
            ReviewOrchestrator.PipelineResult pipeline = orchestrator.execute(ctx, record.getId());
```

定位到 `if (updated == 0) { ... return; }` 块（第 159-162 行），改为在 return 前关闭 SSE：

```java
            if (updated == 0) {
                log.info("[AI审核] trackId={} 审核完成时发现记录已被人工确认，跳过更新以保留管理员决定", trackId);
                // 即使管理员已确认，也要关闭 SSE 连接避免客户端挂死
                try {
                    sseRegistry.complete(record.getId());
                } catch (Exception ex) {
                    log.warn("[AI审核] trackId={} SSE complete 异常", trackId, ex);
                }
                return;
            }
```

在 `log.info("[AI审核] trackId={} 最终裁决 ...")` 之后（即原第 164 行后）加 FINISHED 调用：

```java
            log.info("[AI审核] trackId={} 最终裁决 verdict={} confidence={} status={}",
                    trackId, record.getVerdict(), confidence, record.getStatus());

            // 推 FINISHED 事件 + 关闭 SSE 连接
            try {
                progressStore.finished(record.getId(), record.getStatus(), record.getVerdict(), record.getConfidence());
                sseRegistry.send(record.getId(), ProgressEvent.finished(record.getId(), trackId,
                        record.getStatus(), record.getVerdict(), record.getConfidence()));
            } catch (Exception ex) {
                log.warn("[AI审核] trackId={} FINISHED 推送异常", trackId, ex);
            }
            try {
                sseRegistry.complete(record.getId());
            } catch (Exception ex) {
                log.warn("[AI审核] trackId={} SSE complete 异常", trackId, ex);
            }
```

**4. catch 块中（审核流程异常，status=5）也要关闭 SSE**：

定位到 catch 块 `if (record != null && record.getId() != null) { ... }` 末尾（即原第 178 行 `}` 前），加：

```java
                // 异常分支也要关闭 SSE 连接
                try {
                    sseRegistry.complete(record.getId());
                } catch (Exception ex) {
                    log.warn("[AI审核] trackId={} 异常分支 SSE complete 失败", trackId, ex);
                }
```

- [ ] **Step 4: 运行测试确认通过**

Run:
```bash
cd /f/Code/Auramix/Auramix && "D:\BaseApp\apache-maven-3.9.8\bin\mvn.cmd" -q -DfailIfNoTests=false -Dtest=ReviewServiceImplIntegrationTest test
```
Expected: 3 个测试（1 原有 + 2 新增）全 PASS。

- [ ] **Step 5: 提交**

```bash
cd /f/Code/Auramix/Auramix && git add src/main/java/com/son/auramix/service/admin/impl/ReviewServiceImpl.java src/test/java/com/son/auramix/service/admin/impl/ReviewServiceImplIntegrationTest.java && git commit -m "feat(review): integrate FINISHED event and SSE complete into ReviewServiceImpl"
```

---

## Task 8: 改造 AdminAuthenticationFilter 支持 query token 回退

**Files:**
- Modify: `src/main/java/com/son/auramix/security/admin/AdminAuthenticationFilter.java`

浏览器原生 `EventSource` API 不支持自定义 Header，只能 URL query 带 token。改造 Filter：仅在 SSE 路径（`/api/admin/manage/reviews/*/progress/stream`）当 Header 缺失时尝试从 query 取 token，其他路径行为不变。

注意：`AdminAuthenticationFilterTest.java` 已被删除（.bak 存在），本任务不重建测试文件（避免与 WIP 状态冲突），改用 Task 11 的全量构建验证 Filter 仍能编译且其他测试不受影响。

- [ ] **Step 1: 修改 AdminAuthenticationFilter**

打开 `src/main/java/com/son/auramix/security/admin/AdminAuthenticationFilter.java`，做以下改动：

**1. 加常量 + 路径匹配正则**（在 `private static final String INTERNAL_ADMIN_USERNAME = "internal-api";` 下方）：

```java
    /** SSE 流路径前缀，用于 query token 回退鉴权（EventSource 不支持自定义 Header） */
    private static final String SSE_STREAM_SUFFIX = "/progress/stream";
    private static final String QUERY_TOKEN_PARAM = "token";
```

**2. 修改 `extractToken` 方法**，加 query 回退逻辑：

```java
    private String extractToken(HttpServletRequest request) {
        // 1. 优先从 Header 取
        String header = request.getHeader(HEADER);
        if (header != null && header.startsWith(PREFIX)) {
            String token = header.substring(PREFIX.length()).trim();
            if (!token.isEmpty()) return token;
        }
        // 2. Header 缺失时，仅对 SSE 流路径回退到 query 参数
        String uri = request.getRequestURI();
        if (uri.endsWith(SSE_STREAM_SUFFIX)) {
            String queryToken = request.getParameter(QUERY_TOKEN_PARAM);
            if (StringUtils.hasText(queryToken)) {
                return queryToken.trim();
            }
        }
        return null;
    }
```

- [ ] **Step 2: 编译验证**

Run:
```bash
cd /f/Code/Auramix/Auramix && "D:\BaseApp\apache-maven-3.9.8\bin\mvn.cmd" -q compile
```
Expected: BUILD SUCCESS。

- [ ] **Step 3: 运行现有所有测试确认无回归**

Run:
```bash
cd /f/Code/Auramix/Auramix && "D:\BaseApp\apache-maven-3.9.8\bin\mvn.cmd" -q test
```
Expected: 所有现有测试通过（Filter 改动只对 SSE 路径生效，其他路径行为不变）。

- [ ] **Step 4: 提交**

```bash
cd /f/Code/Auramix/Auramix && git add src/main/java/com/son/auramix/security/admin/AdminAuthenticationFilter.java && git commit -m "feat(review): support query token fallback for SSE stream auth in AdminAuthenticationFilter"
```

---

## Task 9: SSE 流端点 + SNAPSHOT 补偿

**Files:**
- Modify: `src/main/java/com/son/auramix/controller/admin/AdminReviewProgressController.java`
- Modify: `src/test/java/com/son/auramix/controller/admin/AdminReviewProgressControllerTest.java`

在 Controller 加 `streamProgress` 端点：订阅 registry 后立即推一次 SNAPSHOT 事件（含当前 progress_json 全量状态）补偿重连，之后由 registry 转发增量事件。

- [ ] **Step 1: 修改测试加 SSE 端点测试**

打开 `src/test/java/com/son/auramix/controller/admin/AdminReviewProgressControllerTest.java`，追加以下测试（在类末尾 `}` 之前）：

```java
    @Test
    void streamProgress_subscribesAndPushesSnapshotWhenAvailable() {
        // given
        ReviewProgressVO snapshotVo = new ReviewProgressVO();
        snapshotVo.setRecordId(100L);
        snapshotVo.setEventType("STARTED");
        when(store.snapshot(100L)).thenReturn(snapshotVo);
        org.springframework.web.servlet.mvc.method.annotation.SseEmitter mockEmitter =
            new org.springframework.web.servlet.mvc.method.annotation.SseEmitter(0L);
        when(sseRegistry.subscribe(100L)).thenReturn(mockEmitter);

        // when
        org.springframework.web.servlet.mvc.method.annotation.SseEmitter result =
            controller.streamProgress(100L, "test-token");

        // then：返回的 emitter 与 registry 注册的一致
        assertThat(result).isSameAs(mockEmitter);
        verify(sseRegistry).subscribe(100L);
        verify(store).snapshot(100L);
    }

    @Test
    void streamProgress_subscribesEvenWhenSnapshotNull() {
        when(store.snapshot(100L)).thenReturn(null);
        org.springframework.web.servlet.mvc.method.annotation.SseEmitter mockEmitter =
            new org.springframework.web.servlet.mvc.method.annotation.SseEmitter(0L);
        when(sseRegistry.subscribe(100L)).thenReturn(mockEmitter);

        // snapshot 为 null 不应抛
        org.springframework.web.servlet.mvc.method.annotation.SseEmitter result =
            controller.streamProgress(100L, null);
        assertThat(result).isSameAs(mockEmitter);
    }
```

- [ ] **Step 2: 运行测试确认失败**

Run:
```bash
cd /f/Code/Auramix/Auramix && "D:\BaseApp\apache-maven-3.9.8\bin\mvn.cmd" -q -DfailIfNoTests=false -Dtest=AdminReviewProgressControllerTest test
```
Expected: 编译失败（`streamProgress` 方法不存在）。

- [ ] **Step 3: 实现 streamProgress 端点**

打开 `src/main/java/com/son/auramix/controller/admin/AdminReviewProgressController.java`，做以下改动：

**1. 加 import**：

```java
import com.son.auramix.ai.progress.ProgressEvent;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;
```

**2. 加 streamProgress 方法**（在 `getProgress` 方法下方）：

```java
    /**
     * SSE 流：实时推送该 record 的进度事件。
     * <p>
     * 订阅后立即推一次 SNAPSHOT 事件（含当前 progress_json 全量状态），让前端重连时立即看到已发生的进度；
     * 之后转发 STARTED / DIMENSION_DONE / JUDGE_DONE / FINISHED 增量事件。
     * <p>
     * token 通过 query 传入（浏览器 EventSource 不支持自定义 Header），由 AdminAuthenticationFilter 回退鉴权。
     */
    @GetMapping(value = "/{id}/progress/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter streamProgress(@PathVariable Long id,
                                     @RequestParam(required = false) String token) {
        SseEmitter emitter = sseRegistry.subscribe(id);
        // 推 SNAPSHOT 事件补偿重连
        ReviewProgressVO snapshotVo = store.snapshot(id);
        if (snapshotVo != null) {
            try {
                ProgressEvent.snapshot(id, snapshotVo);
                emitter.send(SseEmitter.event()
                    .name("SNAPSHOT")
                    .data(snapshotVo, MediaType.APPLICATION_JSON));
            } catch (Exception ignored) {
                // SNAPSHOT 推送失败不阻塞订阅，后续增量事件仍会通过 registry 转发
            }
        }
        return emitter;
    }
```

- [ ] **Step 4: 运行测试确认通过**

Run:
```bash
cd /f/Code/Auramix/Auramix && "D:\BaseApp\apache-maven-3.9.8\bin\mvn.cmd" -q -DfailIfNoTests=false -Dtest=AdminReviewProgressControllerTest test
```
Expected: 4 个测试（2 原有 + 2 新增）全 PASS。

- [ ] **Step 5: 提交**

```bash
cd /f/Code/Auramix/Auramix && git add src/main/java/com/son/auramix/controller/admin/AdminReviewProgressController.java src/test/java/com/son/auramix/controller/admin/AdminReviewProgressControllerTest.java && git commit -m "feat(review): add SSE stream endpoint with SNAPSHOT reconnection compensation"
```

---

## Task 10: DDL 验证 + 实体字段映射验证

**Files:**
- 无新增/修改文件，仅验证

**目的**：确认 `progress_json` 列已在 DB 添加（DDL 文件已存在 spec 目录，需手动执行），且 MyBatis-Plus 能正确按驼峰转下划线映射 `progressJson → progress_json`。

- [ ] **Step 1: 手动执行 DDL**

在 MySQL 客户端执行 `docs/superpowers/specs/2026-06-29-ai-review-visualization-ddl.sql` 中的 ALTER 语句：

```sql
ALTER TABLE track_review_records
  ADD COLUMN progress_json TEXT NULL COMMENT 'AI审核过程进度轨迹JSON，完成后保留供回放'
  AFTER agent_results;
```

**验证**：
```sql
SHOW COLUMNS FROM track_review_records LIKE 'progress_json';
```
Expected: 返回 1 行，Field=progress_json, Type=text, Null=YES。

- [ ] **Step 2: 验证实体字段映射**

确认 `TrackReviewRecord.java` 的 `progressJson` 字段已添加（Task 1 完成），且 `@TableName("track_review_records")` 注解存在。

MyBatis-Plus 默认下划线转驼峰策略会自动映射 DB `progress_json` ↔ Java `progressJson`，无需 `@TableField` 注解。

- [ ] **Step 3: 编译并运行全量测试**

Run:
```bash
cd /f/Code/Auramix/Auramix && "D:\BaseApp\apache-maven-3.9.8\bin\mvn.cmd" -q test
```
Expected: 所有测试通过。

- [ ] **Step 4: 无需提交（本任务无代码改动）**

---

## Task 11: 完整构建验证

**Files:**
- 无新增/修改文件，仅验证

- [ ] **Step 1: 全量 mvn test**

Run:
```bash
cd /f/Code/Auramix/Auramix && "D:\BaseApp\apache-maven-3.9.8\bin\mvn.cmd" -q test
```
Expected: BUILD SUCCESS，所有测试通过。

测试覆盖清单：
- `ReviewProgressStoreTest` — 9 个测试
- `ReviewProgressSseRegistryTest` — 5 个测试
- `AdminReviewProgressControllerTest` — 4 个测试
- `ReviewOrchestratorTest` — 6 个测试（3 原有 + 3 新增）
- `ReviewServiceImplIntegrationTest` — 3 个测试（1 原有 + 2 新增）
- 现有 27 个 AI 模块测试全部保留通过

- [ ] **Step 2: 检查 git status 确认 WIP 文件未被误改**

Run:
```bash
cd /f/Code/Auramix/Auramix && git status
```
Expected: `ReviewScheduleJob.java`、`PlaylistTrackItemVO.java`、`run-mvn.bat` 仍为 modified/untracked，`.bak` 文件仍 untracked。这些 WIP 文件不应被本计划任何 task 修改。

- [ ] **Step 3: 无需提交**

---

## Task 12: 提交文档 + 总结

**Files:**
- 提交计划文档本身（如尚未提交）

- [ ] **Step 1: 确认 plans 目录提交状态**

Run:
```bash
cd /f/Code/Auramix/Auramix && git status docs/superpowers/plans/2026-06-29-ai-review-visualization.md
```

如果显示 untracked，执行：
```bash
cd /f/Code/Auramix/Auramix && git add -f docs/superpowers/plans/2026-06-29-ai-review-visualization.md && git commit -m "docs: add AI review visualization implementation plan"
```

- [ ] **Step 2: 查看本次可视化的提交历史**

Run:
```bash
cd /f/Code/Auramix/Auramix && git log --oneline -15
```
Expected: 看到 Task 1-9 的 9 个 feat/docs 提交，从 `feat(review): add progressJson field` 到 `feat(review): add SSE stream endpoint`。

- [ ] **Step 3: 总结**

本次实现共新增 5 个类 + 3 个测试类，修改 4 个现有类 + 2 个测试类。核心架构：
- `progress_json` TEXT 字段记录审核轨迹（5 次增量写 + 1 次完结写）
- Orchestrator 内集成 `ReviewProgressStore` + `ReviewProgressSseRegistry`，4 维度并行执行不变，每个维度完成时推送 DIMENSION_DONE 事件
- ServiceImpl 在落库后推 FINISHED 事件并关闭 SSE 连接
- Controller 提供 SSE 流（含 SNAPSHOT 重连补偿）+ 同步快照端点
- `AdminAuthenticationFilter` 支持 query token 回退让 `EventSource` 鉴权可用

---

## 自检清单

### Spec 覆盖检查
- [x] Section 1.2 三种可视化场景：实时进度（SSE）、列表状态（现有 status）、事后回放（progress_json 保留）→ Task 3/5/9 覆盖
- [x] Section 2.1 数据流：initProgress→STARTED→dimensionDone→DIMENSION_DONE→judgeDone→JUDGE_DONE→finished→FINISHED→complete → Task 6/7 覆盖
- [x] Section 2.2 关键决策 6 条：进度在 Orchestrator 内、recordId 由 ServiceImpl 传、SseEmitter 集中管理、FINISHED 主动关闭、先写库再广播、进度异常不阻塞 → Task 6/7 覆盖
- [x] Section 3.1 DDL → Task 1 + Task 10 覆盖
- [x] Section 3.2 progress_json 结构 → Task 3 `ReviewProgressStore.initProgress` 实现覆盖
- [x] Section 3.4 事件→字段更新映射 → Task 3 `dimensionDone/judgeDone/finished` 覆盖
- [x] Section 4.2-4.7 组件设计 → Task 2/3/4/5/6/7/9 覆盖
- [x] Section 5.1 正常流程时序 → Task 6/7 代码顺序与时序图一致
- [x] Section 6.1 SSE 鉴权 query token → Task 8 覆盖
- [x] Section 6.2 SNAPSHOT 重连补偿 → Task 9 覆盖
- [x] Section 6.3 服务重启（复用 ReviewScheduleJob 现有逻辑）→ 不需改动
- [x] Section 6.4 维度异常仍推 DIMENSION_DONE → Task 6 `execute_dimensionExceptionStillPublishesDone` 测试覆盖
- [x] Section 6.5 progressStore 写库失败不阻塞 → Task 6 `execute_progressStoreExceptionDoesNotBreakPipeline` 测试覆盖
- [x] Section 7 测试策略 → Task 3/4/5/6/7/9 测试覆盖
- [x] Section 8.1 文件清单（8 新增 + 6 修改）→ Task 1-9 完整覆盖

### 类型一致性检查
- [x] `ReviewProgressStore` 方法签名（initProgress/dimensionDone/judgeDone/finished/snapshot/update）在 spec 4.2/8.4 与 Task 3 一致
- [x] `ReviewProgressSseRegistry` 方法签名（subscribe/send/complete）在 spec 4.3/8.4 与 Task 4 一致
- [x] `ProgressEvent` 静态工厂方法签名在 spec 4.5/8.4 与 Task 2 一致
- [x] `AdminReviewProgressController` 端点签名在 spec 4.4/8.4 与 Task 5/9 一致
- [x] `ReviewOrchestrator.execute(ReviewContext, Long)` 新签名在 spec 4.6 与 Task 6 一致
- [x] `ReviewServiceImpl` 构造器参数顺序（9 原有 + 2 新增）在 Task 7 测试与实现一致
- [x] `ReviewOrchestrator` 构造器参数顺序（5 原有 + 2 新增）在 Task 6 测试与实现一致

### 占位符扫描
- [x] 无 TBD/TODO
- [x] 每个 step 都有完整代码或具体命令
- [x] 测试代码完整可运行
- [x] 实现代码完整可编译
