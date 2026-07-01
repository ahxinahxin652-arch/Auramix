# AI 审核流程可视化设计文档

> 日期: 2026-06-29
> 状态: 已确认
> 范围: AI 审核流程可视化（SSE 实时进度 + 同步快照 + 事后回放）

---

## 1. 概述

### 1.1 背景

`2026-06-28-ai-review-optimization-design.md` 完成了基础优化：Prompt 强化、4 维度并行、结构化汇总、管理员端维度明细。当前审核流程对管理员仍是"黑盒"——`triggerReview` 异步执行 4 维度并行 + 串行裁决，最终一次性写 `agent_results`，管理员只能看到 `status` int 和完成后的 `dimensionDetails` 字符串，看不到过程。

### 1.2 目标

在不破坏现有架构和接口的前提下，实现三种可视化场景：

- **实时进度推送**：管理员在审核详情页看到 4 维度逐个完成（"政治敏感 ✓ 92 → 暴力恐怖审核中 → …"），通过 SSE 推送
- **列表页状态展示**：管理员刷新列表即可看到每条记录当前状态，用现有 `status` int 表达
- **事后回放轨迹**：审核完成后查看某条记录的执行时间线（每维度开始/结束时间、耗时、verdict），用于审计/复盘

### 1.3 关键约束

- **执行策略不变**：4 维度仍并行（`CompletableFuture.supplyAsync`），不改为串行；进度由每个维度完成事件触发推送
- **状态值不变**：`TrackReviewRecord.status` 仍为 0~5，语义不变
- **现有接口不变**：`GET /api/admin/manage/reviews/pending`、`POST /{id}/confirm` 签名和响应不变
- **现有组件不变**：4 个维度 Agent、`ReviewJudgeAgent`、`AgentResultsAggregator`、`AgentResultsFormatter`、`ReviewScheduleJob` 不改
- **`ReviewListItemVO` 不增字段**：列表页继续用 `status` int，不解析 `progress_json`
- **传输机制**：用 SSE（Spring MVC 原生 `SseEmitter`），不引入 WebSocket/STOMP
- **进度存储**：DB（`progress_json` TEXT 字段），不用 Redis

---

## 2. 架构总览

### 2.1 数据流

```
ReviewServiceImpl.triggerReview(trackId)
  @Async reviewTaskExecutor
  ├─ 1. 加载 Track → status=3
  ├─ 2. 查 album/artists → insert TrackReviewRecord(status=0)
  ├─ 3. lyricsFetcher.fetch
  ├─ 4. progressStore.initProgress(recordId, ...)        ← 写骨架
  ├─ 5. orchestrator.execute(ctx, recordId)              ← 传 recordId
  │      │
  │      ├─ 5a. sorter.sort(dimensionAgents)
  │      ├─ 5b. sseRegistry.send(STARTED)
  │      ├─ 5c. 4 维度并行 supplyAsync：
  │      │     每个维度 review(ctx) 完成 →
  │      │       progressStore.dimensionDone(recordId, result)  ← 增量更新
  │      │       sseRegistry.send(DIMENSION_DONE)
  │      ├─ 5d. 阻塞汇合
  │      ├─ 5e. judge.judge() →
  │      │       progressStore.judgeDone(recordId, result)
  │      │       sseRegistry.send(JUDGE_DONE)
  │      ├─ 5f. aggregator.build → agent_results JSON
  │      └─ 5g. 返回 PipelineResult
  ├─ 6. record.agentResults = json, status/confidence/verdict 落库
  ├─ 7. progressStore.finished(recordId, finalStatus, ...)
  │     sseRegistry.send(FINISHED)
  │     sseRegistry.complete(recordId)                   ← 关闭所有 SSE 连接
  └─ done

SSE: GET /api/admin/manage/reviews/{id}/progress/stream
  ├─ SseEmitter 注册到 registry
  ├─ 先推 SNAPSHOT 事件（含当前 progress_json 全量状态）
  └─ 实时转发 STARTED / DIMENSION_DONE / JUDGE_DONE / FINISHED

同步快照: GET /api/admin/manage/reviews/{id}/progress
  └─ 返回当前 progress_json 反序列化的 VO
```

### 2.2 关键决策

1. **进度更新在 Orchestrator 内部**：直接调 `ReviewProgressStore` + `ReviewProgressSseRegistry`，不引入 ApplicationEvent 解耦，保持组件数量少、调用路径直接
2. **ServiceImpl 把 recordId 传给 Orchestrator**：Orchestrator 不知道 record 主键，需 ServiceImpl 传入
3. **SseEmitter 集中管理**：`ReviewProgressSseRegistry` 维护 `Map<Long, List<SseEmitter>>`（recordId → emitters）
4. **FINISHED 事件主动关闭 SSE 连接**：避免客户端长连挂死
5. **先写库再广播**：订阅者收到事件时 DB 已是最新状态，后续同步查询结果一致
6. **进度异常不阻塞主流程**：`progressStore` 写库失败 try-catch 吞掉记 log，不影响 `agent_results` 落库

### 2.3 不变的东西

- 4 维度 Agent / `ReviewJudgeAgent` / `AbstractDimensionAgent` 内部逻辑
- `AgentResultsAggregator` / `AgentResultsFormatter`
- 现有 `GET /pending` / `POST /{id}/confirm` 接口
- `ReviewScheduleJob` 的 5 个状态值与定时策略
- 4 维度并行执行策略（仍 `CompletableFuture.supplyAsync`）
- `ReviewListItemVO` 字段

### 2.4 新增的东西

- `TrackReviewRecord` 增 1 个字段 `progressJson` (TEXT)
- `ReviewProgressStore` / `ReviewProgressSseRegistry` / `ProgressEvent` / `ReviewProgressVO`
- `AdminReviewProgressController`（SSE 流 + 同步快照两个端点）
- `AdminAuthenticationFilter` 支持 query token 回退（SSE 鉴权用）
- `ReviewOrchestrator` 新增 `recordId` 参数 + 2 个依赖
- `ReviewServiceImpl` 新增 2 个依赖 + `initProgress`/`finished` 调用

---

## 3. 数据模型

### 3.1 DDL 变更

```sql
ALTER TABLE track_review_records
  ADD COLUMN progress_json TEXT NULL COMMENT 'AI审核过程进度轨迹JSON，完成后保留供回放'
  AFTER agent_results;
```

- 类型 `TEXT`：与 `agent_results` 一致，可存约 65KB，足够 5 个步骤的时间线
- 允许 NULL：旧记录无此字段；新记录在 `triggerReview` 入口就写入初始骨架（非 NULL）
- 不加索引：按 record_id 查进度走主键，progress_json 不参与 WHERE

### 3.2 `progress_json` 结构规范

```json
{
  "recordId": 123456,
  "trackId": 789,
  "trackTitle": "示例歌曲",
  "startedAt": "2026-06-29T10:00:00.123",
  "dimensions": [
    {
      "agentName": "PoliticalSensitivity",
      "displayName": "政治敏感",
      "order": 10,
      "status": "DONE",
      "verdict": "PASS",
      "confidence": 95,
      "reason": null,
      "startedAt": "2026-06-29T10:00:00.234",
      "finishedAt": "2026-06-29T10:00:01.456",
      "durationMs": 1222
    },
    {
      "agentName": "ViolenceTerror",
      "displayName": "暴力恐怖",
      "order": 20,
      "status": "PENDING",
      "verdict": null,
      "confidence": null,
      "reason": null,
      "startedAt": null,
      "finishedAt": null,
      "durationMs": null
    }
  ],
  "judge": {
    "status": "PENDING",
    "verdict": null,
    "confidence": null,
    "reason": null,
    "startedAt": null,
    "finishedAt": null,
    "durationMs": null
  },
  "finishedAt": null,
  "finalStatus": null,
  "finalVerdict": null,
  "finalConfidence": null
}
```

### 3.3 状态枚举

- `dimensions[].status`: `PENDING` / `RUNNING` / `DONE` / `FAIL`
- `judge.status`: `PENDING` / `RUNNING` / `DONE` / `FAIL`
- `finalStatus`: 取自 `TrackReviewRecord.status` 的 int 值（1/3/5 等），完成后回填

### 3.4 事件 → 字段更新映射

| 事件类型 | 更新 progress_json 的字段 |
|---------|--------------------------|
| `STARTED` | `startedAt`；`dimensions[*].status=PENDING`；`judge.status=PENDING` |
| `DIMENSION_DONE` | 对应维度的 `status=DONE` / `verdict` / `confidence` / `reason` / `finishedAt` / `durationMs` |
| `JUDGE_DONE` | `judge.status=DONE` + `verdict/confidence/reason/finishedAt/durationMs` |
| `FINISHED` | `finishedAt` + `finalStatus` + `finalVerdict` + `finalConfidence` |

### 3.5 写库策略

- **每次更新都是 read-modify-write 整个 progress_json**：单行单列，无并发竞争（同一 record 的所有事件都在同一个 `reviewTaskExecutor` 工作线程或顺序触发）
- 用 `objectMapper.readTree` → 修改节点 → `writeValueAsString` → `LambdaUpdateWrapper` 仅更新 progressJson 列
- 封装在 `ReviewProgressStore` 内，避免业务代码直接操作 JSON

### 3.6 实体类改动

`TrackReviewRecord.java` 加一个字段：

```java
/** AI 审核过程进度轨迹 JSON；审核中实时增量更新，完成后保留供事后回放 */
private String progressJson;
```

其余字段、`@TableName`、`@TableId` 不变。MyBatis-Plus 自动按列名 `progress_json` 映射。

### 3.7 与现有 `agent_results` 的关系

| 字段 | 写入时机 | 用途 |
|------|---------|------|
| `progress_json` | 流水线过程中增量写（5 次） | 实时进度、事后回放时间线 |
| `agent_results` | 流水线完结时一次性写（1 次） | 最终 4 维度+裁决的结构化结果，供 `AgentResultsFormatter` 渲染列表 dimensionDetails |

两者并存，职责分离。FINISHED 后 `progress_json` 不再变化，但保留在 DB 中作为审计回放依据。

---

## 4. 核心组件

### 4.1 组件清单

| 组件 | 类型 | 职责 |
|------|------|------|
| `ReviewProgressStore` | @Component | 封装 progress_json 的 read-modify-write |
| `ReviewProgressSseRegistry` | @Component | 管理 `Map<Long, List<SseEmitter>>`，订阅/取消/广播 |
| `AdminReviewProgressController` | @RestController | SSE 流端点 + 同步快照端点 |
| `ReviewProgressVO` | VO | SSE 推送和快照接口的统一响应结构 |
| `ProgressEvent` | DTO + 工厂 | 构造 SSE 推送的 payload（普通 DTO，非 Spring ApplicationEvent） |

### 4.2 `ReviewProgressStore`

```java
@Component
@RequiredArgsConstructor
@Slf4j
public class ReviewProgressStore {
    private final TrackReviewRecordMapper reviewRecordMapper;
    private final ObjectMapper objectMapper;

    /** 初始化骨架，triggerReview 入口调用 */
    public void initProgress(Long recordId, Long trackId, String trackTitle,
                             List<DimensionAgent> sortedAgents) { ... }

    /** 通用更新：传入 mutator 函数修改 JsonNode，回写 DB */
    public void update(Long recordId, Consumer<JsonNode> mutator) {
        TrackReviewRecord r = reviewRecordMapper.selectById(recordId);
        String json = r.getProgressJson();
        JsonNode root = objectMapper.readTree(json);
        mutator.accept(root);
        String updated = objectMapper.writeValueAsString(root);
        reviewRecordMapper.update(null,
            new LambdaUpdateWrapper<TrackReviewRecord>()
                .eq(TrackReviewRecord::getId, recordId)
                .set(TrackReviewRecord::getProgressJson, updated));
    }

    /** 单维度完成 */
    public void dimensionDone(Long recordId, AgentResult result) { ... }
    /** 裁决完成 */
    public void judgeDone(Long recordId, AgentResult judgeResult) { ... }
    /** 流水线完结 */
    public void finished(Long recordId, Integer finalStatus, Integer finalVerdict, Integer finalConfidence) { ... }
    /** 读取当前快照 */
    public ReviewProgressVO snapshot(Long recordId) { ... }
}
```

**关键设计**：
- `update(recordId, mutator)` 用 `Consumer<JsonNode>` 参数化"改哪棵子树"，避免 5 个私有方法重复样板
- 集中异常处理：`readTree`/`writeValueAsString` 的 `JsonProcessingException` 统一 try-catch 吞掉记 log，不抛出，不影响主流程

### 4.3 `ReviewProgressSseRegistry`

```java
@Component
@Slf4j
public class ReviewProgressSseRegistry {
    private final Map<Long, List<SseEmitter>> emitters = new ConcurrentHashMap<>();

    public SseEmitter subscribe(Long recordId) {
        SseEmitter emitter = new SseEmitter(0L);  // 永不超时，由 FINISHED 主动 complete
        emitters.computeIfAbsent(recordId, k -> new CopyOnWriteArrayList<>()).add(emitter);
        emitter.onCompletion(() -> remove(recordId, emitter));
        emitter.onTimeout(() -> remove(recordId, emitter));
        emitter.onError(ex -> remove(recordId, emitter));
        return emitter;
    }

    public void send(Long recordId, ReviewProgressVO payload) {
        List<SseEmitter> list = emitters.get(recordId);
        if (list == null) return;
        for (SseEmitter e : list) {
            try {
                e.send(SseEmitter.event()
                    .name(payload.getEventType())
                    .data(payload, MediaType.APPLICATION_JSON));
            } catch (Exception ex) {
                remove(recordId, e);
            }
        }
    }

    public void complete(Long recordId) {
        List<SseEmitter> list = emitters.remove(recordId);
        if (list != null) list.forEach(e -> {
            try { e.complete(); } catch (Exception ignored) {}
        });
    }

    private void remove(Long recordId, SseEmitter emitter) { ... }
}
```

- `SseEmitter(0L)`：永不超时，由 FINISHED 主动 `complete()`
- `CopyOnWriteArrayList`：广播时遍历、订阅时 add，无并发修改异常
- 发送失败立即移除该 emitter，避免后续广播重复报错

### 4.4 `AdminReviewProgressController`

```java
@RestController
@RequestMapping("/api/admin/manage/reviews")
@RequiredArgsConstructor
@PreAuthorize("hasAuthority('ROOT_ADMIN') or hasAuthority('ADMIN')")
public class AdminReviewProgressController {

    private final ReviewProgressSseRegistry sseRegistry;
    private final ReviewProgressStore store;

    /** SSE 流：实时推送该 record 的进度事件 */
    @GetMapping(value = "/{id}/progress/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter streamProgress(@PathVariable Long id,
                                     @RequestParam(required = false) String token) {
        SseEmitter emitter = sseRegistry.subscribe(id);
        ReviewProgressVO snapshot = store.snapshot(id);
        if (snapshot != null) {
            try {
                emitter.send(SseEmitter.event().name("SNAPSHOT")
                    .data(snapshot, MediaType.APPLICATION_JSON));
            } catch (Exception ignored) {}
        }
        return emitter;
    }

    /** 同步快照：详情页/列表页首次加载用 */
    @GetMapping("/{id}/progress")
    public Result<ReviewProgressVO> getProgress(@PathVariable Long id) {
        ReviewProgressVO vo = store.snapshot(id);
        if (vo == null) throw new BusinessException(ResultCode.REVIEW_NOT_FOUND);
        return Result.success(vo);
    }
}
```

- 两个端点权限同 `AdminReviewController`（`ROOT_ADMIN` 或 `ADMIN`）
- SSE 端点 produces `text/event-stream`
- SSE 端点先推 `SNAPSHOT` 事件（含当前完整进度），让前端重连时立即看到已发生的进度；之后才转 `STARTED`/`DIMENSION_DONE` 等增量事件
- SSE 端点接受 `token` query 参数作为 Header 回退（鉴权见 6.1）

### 4.5 `ReviewProgressVO`

```java
@Data
public class ReviewProgressVO {
    private Long recordId;
    private Long trackId;
    private String trackTitle;
    private String eventType;          // STARTED / DIMENSION_DONE / JUDGE_DONE / FINISHED / SNAPSHOT
    private LocalDateTime startedAt;
    private List<DimensionProgressVO> dimensions;
    private JudgeProgressVO judge;
    private LocalDateTime finishedAt;
    private Integer finalStatus;
    private Integer finalVerdict;
    private Integer finalConfidence;

    @Data
    public static class DimensionProgressVO {
        private String agentName;
        private String displayName;
        private Integer order;
        private String status;          // PENDING / RUNNING / DONE / FAIL
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

`ProgressEvent` 提供静态工厂方法构造各类事件的 VO：
- `started(recordId, trackId, trackTitle, agents)`
- `dimensionDone(recordId, trackId, result)`
- `judgeDone(recordId, trackId, result)`
- `finished(recordId, trackId, finalStatus, finalVerdict, finalConfidence)`
- `snapshot(recordId, fullState)`

### 4.6 `ReviewOrchestrator` 改动

```java
@Slf4j
@Component
@RequiredArgsConstructor
public class ReviewOrchestrator {
    private final List<DimensionAgent> dimensionAgents;
    private final ReviewJudgeAgent reviewJudgeAgent;
    private final AgentResultsAggregator aggregator;
    private final Executor reviewTaskExecutor;
    private final ReviewAgentSorter sorter;
    private final ReviewProgressStore progressStore;        // 新增
    private final ReviewProgressSseRegistry sseRegistry;    // 新增

    public PipelineResult execute(ReviewContext ctx, Long recordId) {   // 新增 recordId 参数
        List<DimensionAgent> sortedAgents = sorter.sort(dimensionAgents);

        progressStore.initProgress(recordId, ctx.getTrackId(), ctx.getTrackTitle(), sortedAgents);
        sseRegistry.send(recordId, ProgressEvent.started(recordId, ctx.getTrackId(),
                ctx.getTrackTitle(), sortedAgents));

        List<CompletableFuture<AgentResult>> futures = sortedAgents.stream()
            .map(agent -> CompletableFuture.supplyAsync(() -> {
                AgentResult r;
                try {
                    r = agent.review(ctx);
                } catch (Exception e) {
                    // 沿用 0768cd3 的兜底策略：先试 getName()，失败降级到类名
                    String name;
                    try { name = agent.getName(); }
                    catch (Exception ignored) { name = agent.getClass().getSimpleName(); }
                    r = AgentResult.builder()
                        .agentName(name)
                        .verdict("FAIL").confidence(0)
                        .reason("agent调用异常: " + e.getClass().getSimpleName() + " - " + e.getMessage())
                        .build();
                }
                progressStore.dimensionDone(recordId, r);
                sseRegistry.send(recordId, ProgressEvent.dimensionDone(recordId, ctx.getTrackId(), r));
                return r;
            }, reviewTaskExecutor))
            .toList();

        List<AgentResult> dims = futures.stream().map(CompletableFuture::join).toList();
        AgentResult finalResult = reviewJudgeAgent.judge(ctx, dims);
        progressStore.judgeDone(recordId, finalResult);
        sseRegistry.send(recordId, ProgressEvent.judgeDone(recordId, ctx.getTrackId(), finalResult));

        String agentResultsJson;
        try {
            agentResultsJson = aggregator.build(dims, finalResult);
        } catch (Exception e) {
            agentResultsJson = "{}";
        }
        return new PipelineResult(dims, finalResult, agentResultsJson);
    }
}
```

### 4.7 `ReviewServiceImpl` 改动

```java
@RequiredArgsConstructor
public class ReviewServiceImpl implements ReviewService {
    // 已有 9 个依赖...
    private final ReviewProgressStore progressStore;        // 新增
    private final ReviewProgressSseRegistry sseRegistry;    // 新增

    @Override
    @Async("reviewTaskExecutor")
    public void triggerReview(Long trackId) {
        // ... 已有流程不变 ...

        // 在 insert(record) 后、orchestrator.execute(ctx) 前：
        // initProgress 已在 orchestrator.execute 内部调用（传 recordId 即可）

        ReviewOrchestrator.PipelineResult pipeline = orchestrator.execute(ctx, record.getId());  // 传 recordId

        // ... 已有的 agent_results / status / confidence / verdict 落库不变 ...

        // 在条件更新成功后，发布 FINISHED
        progressStore.finished(record.getId(), record.getStatus(), record.getVerdict(), record.getConfidence());
        sseRegistry.send(record.getId(), ProgressEvent.finished(record.getId(), trackId,
                record.getStatus(), record.getVerdict(), record.getConfidence()));
        sseRegistry.complete(record.getId());
    }
}
```

**说明**：`initProgress` 由 Orchestrator 内部调用（因为它需要 `sortedAgents` 列表构造骨架的 dimensions 数组）；`finished` 由 ServiceImpl 调用（因为它知道落库后的 `record.getStatus()`）。

---

## 5. 数据流时序

### 5.1 正常流程时序

```
ServiceImpl (async)     Orchestrator           Store              SseRegistry         Admin浏览器
    │                       │                    │                    │                     │
    │ triggerReview         │                    │                    │                     │
    │ load track/album      │                    │                    │                     │
    │ insert record         │                    │                    │                     │ (1) GET /progress/stream
    │ lyricsFetcher.fetch   │                    │                    │                     │     → SseEmitter 注册
    │                       │                    │                    │←───────────────────│
    │ orchestrator.execute  │                    │                    │                     │ (返回 SseEmitter)
    │   (ctx, recordId) ───→│                    │                    │                     │
    │                       │ initProgress       │                    │                     │
    │                       │───────────────────→│ INSERT骨架         │                     │
    │                       │ sseRegistry.send ──→│                    │ send(STARTED)       │
    │                       │                    │                    │───────────────────→│ STARTED
    │                       │ 4× supplyAsync     │                    │                     │
    │                       │─→ agentA.review    │                    │                     │
    │                       │─→ agentB.review    │                    │                     │
    │                       │─→ agentC.review    │                    │                     │
    │                       │─→ agentD.review    │                    │                     │
    │                       │                    │                    │                     │
    │                  agentA 完成               │                    │                     │
    │                       │ store.dimensionDone│                    │                     │
    │                       │───────────────────→│ UPDATE progress    │                     │
    │                       │ sseRegistry.send   │                    │                     │
    │                       │──────────────────────────────────────────→ DIMENSION_DONE(A)─→│
    │                       │                    │                    │                     │
    │                  agentB/C/D 完成（顺序不定）│                    │                     │
    │                       │ 类似上面           │                    │                     │
    │                       │                    │                    │                     │
    │                  futures.join × 4          │                    │                     │
    │                       │ judge.judge        │                    │                     │
    │                       │ store.judgeDone    │                    │                     │
    │                       │───────────────────→│ UPDATE judge       │                     │
    │                       │ sseRegistry.send   │                    │                     │
    │                       │──────────────────────────────────────────→ JUDGE_DONE ───────→│
    │                       │                    │                    │                     │
    │                       │ return PipelineResult                  │                     │
    │                       │←───────────────────│                    │                     │
    │ update record         │                    │                    │                     │
    │ (agent_results, ...)  │                    │                    │                     │
    │                       │                    │                    │                     │
    │ store.finished        │                    │                    │                     │
    │ sseRegistry.send ──────────────────────────────────────────────→ FINISHED ──────────→│
    │ sseRegistry.complete ──────────────────────────────────────────→ complete()          │ (EventSource 关闭)
    │ done                  │                    │                    │                     │
```

### 5.2 关键时序约束

1. **`initProgress` 在 SSE 订阅后才被调用**：前端先建立 SSE 流（1），然后 ServiceImpl 在另一异步线程才开始审核。如果前端订阅时 `progress_json` 已存在，控制器推 SNAPSHOT 事件补偿；如果还没建好，前端只收增量事件也无影响——SNAPSHOT 是兜底
2. **`dimensionDone` 写库与 `send` 顺序**：先写库再广播。订阅者收到事件时 DB 已是最新；后续同步查询结果一致
3. **`finished` 写库与 `complete` 顺序**：先发 FINISHED 事件再 `complete()`。前端先收到最终结果再看到连接关闭
4. **4 维度并行但 dimensionDone 串行写库**：4 个 agent 并行 review，但 `store.dimensionDone` 调用发生在各自工作线程，DB 写是顺序串行的（MySQL 行锁）。这正是"4 维度并行 + 进度逐个推送"的执行策略

### 5.3 `progress_json` 状态演进

| 时点 | progress_json 状态 |
|------|-------------------|
| `insert record` 后、`initProgress` 前 | NULL |
| `initProgress` 后 | 骨架：4 维度全 PENDING + judge PENDING + startedAt |
| 第 1 个维度完成 | 1 维度 DONE + 3 维度 PENDING |
| 第 2 个维度完成 | 2 维度 DONE + 2 维度 PENDING |
| 第 3 个维度完成 | 3 维度 DONE + 1 维度 PENDING |
| 第 4 个维度完成 | 4 维度 DONE + judge PENDING |
| `judgeDone` 后 | judge DONE |
| `finished` 后 | finishedAt + finalStatus + finalVerdict + finalConfidence 已填 |

---

## 6. 错误处理与边界

### 6.1 SSE 鉴权：query token 回退

项目用 `AdminAuthenticationFilter` 做 token 鉴权（Header 传 token）。浏览器原生 `EventSource` API 不支持自定义 Header，只能 URL 带 query 或 Cookie。

**方案**：改造 `AdminAuthenticationFilter` 支持 query token 回退，仅对 `/api/admin/manage/reviews/*/progress/stream` 路径生效。

- 其他路径仍只认 Header token，行为不变
- SSE 端点 URL 形如 `/api/admin/manage/reviews/123/progress/stream?token=xxx`
- Filter 在 Header 缺失时尝试从 query 取 token，校验逻辑复用现有 `AdminTokenStore`

**简化备选**（如不想动 Filter）：SSE 控制器内手动 `adminTokenStore.verify(token)`，Filter 放行该路径。本设计采用方案 A（改 Filter），保持鉴权逻辑集中。

### 6.2 客户端断连/重连

- **断连**：`SseEmitter.onCompletion/onError/onTimeout` 回调自动从 registry 移除
- **重连**：浏览器 `EventSource` 自动重连。重连后服务端在 `subscribe` 后立即推 `SNAPSHOT` 事件（含当前 `progress_json` 全量状态），前端可据此恢复 UI
- **多次断连**：每次重连都推一次 SNAPSHOT，前端需做幂等处理（按 `eventType=SNAPSHOT` 刷新整个 UI，不要叠加到增量事件上）

### 6.3 服务重启

- **审核进行中服务重启**：`reviewTaskExecutor` 线程池销毁，`triggerReview` 异步线程死掉，record 卡在 `status=0` 且 `progress_json` 部分完成
- **现有兜底已覆盖**：`ReviewScheduleJob.retryStuckReviewRecords` 每小时扫描 `status=0` 超过 30 分钟的记录，删除后重新触发
- **重新触发会新 insert record**（旧 record 被删），新 record 走完整流程，`progress_json` 从骨架重新开始
- **无需额外处理**

### 6.4 维度异常仍推 DIMENSION_DONE

Orchestrator 每个 `agent.review(ctx)` 已包 try-catch，转 FAIL 占位 `AgentResult`。修改后 `dimensionDone` 调用放在 try-catch 内，无论 review 成功还是异常转 FAIL，都推送 DIMENSION_DONE 事件：

```java
.map(agent -> CompletableFuture.supplyAsync(() -> {
    AgentResult r;
    try {
        r = agent.review(ctx);
    } catch (Exception e) {
        r = AgentResult.builder().verdict("FAIL").confidence(0)
                       .reason("agent调用异常: ...").build();
    }
    progressStore.dimensionDone(recordId, r);
    sseRegistry.send(recordId, ProgressEvent.dimensionDone(recordId, trackId, r));
    return r;
}, reviewTaskExecutor))
```

前端看到的进度一定走到 4/4，不会卡在中间。

### 6.5 `progressStore` 写库失败不阻塞主流程

- DB 写失败不应阻塞主流程
- `ReviewProgressStore.dimensionDone`/`judgeDone`/`finished` 内部 try-catch，失败只记 log，不抛
- SSE 推送仍尝试发送（DB 状态可能滞后但前端能看到进度）
- 最终 `agent_results` 仍正常落库（不受影响）

### 6.6 SSE 发送失败

- `sseRegistry.send` 单个 emitter 发送失败，移除该 emitter，不影响其他订阅者
- 已在 4.3 设计：`try { e.send } catch { remove }`

### 6.7 并发订阅同一 record

- 多个管理员同时订阅同一 record：`Map<Long, List<SseEmitter>>` 支持多 emitter
- 广播时遍历 list 全发，无冲突
- FINISHED 时 `complete()` 关闭所有

### 6.8 FINISHED 竞态

`finished` 事件由 ServiceImpl 在 `reviewRecordMapper.update(...)` 之后调用。但 `update` 用条件 `WHERE status=0`，如果管理员已确认（status=4），updated=0，ServiceImpl 不再更新 `finalStatus` 字段——但 `progress_json` 仍照常推 FINISHED，`finalStatus = record.getStatus()`（内存值，1/3/5）。

**简化处理**：前端收到 FINISHED 后关闭进度面板即可，不关心 DB 真实状态——因为这种竞态极少（管理员在审核完成的瞬间确认）。

---

## 7. 测试策略

### 7.1 测试分层

| 层级 | 测试类 | 覆盖范围 |
|------|--------|---------|
| 单元 | `ReviewProgressStoreTest` | initProgress / dimensionDone / judgeDone / finished 的 JSON 读写正确性 |
| 单元 | `ReviewProgressSseRegistryTest` | subscribe / send / complete / 发送失败移除 |
| 单元 | `AdminReviewProgressControllerTest` | MockMvc SSE 端点 + 快照端点 |
| 集成 | `ReviewOrchestratorTest`（扩展） | 已有 3 个测试 + 新增：进度事件按序触发、维度异常仍推 DIMENSION_DONE |
| 集成 | `ReviewServiceImplIntegrationTest`（扩展） | 已有 1 个测试 + 新增：FINISHED 后 progress_json 完整 |

### 7.2 `ReviewProgressStoreTest`

测试要点：
- `initProgress` 写入骨架：4 维度 PENDING + judge PENDING + startedAt 非空
- `dimensionDone` 更新对应维度：status=DONE / verdict / confidence / reason / finishedAt / durationMs
- `judgeDone` 更新 judge 节点
- `finished` 更新 finishedAt / finalStatus / finalVerdict / finalConfidence
- **JSON 顺序保持**：dimensions 数组顺序按 `@Order` 不变
- **未知 agentName 的 dimensionDone**：不抛异常，记 log（防御性）
- **progress_json 为 null 时 update**：不抛异常，记 log（边界）

Mock：`TrackReviewRecordMapper`、`ObjectMapper`（用真实实例）

### 7.3 `ReviewProgressSseRegistryTest`

测试要点：
- `subscribe` 返回 emitter 且加入 list
- `send` 广播到所有订阅者
- `send` 单个 emitter 抛异常时移除该 emitter，其他订阅者仍收到
- `complete` 关闭所有 emitter 并从 map 移除
- 并发：多线程同时 subscribe 同一 recordId 不出并发错误

### 7.4 `AdminReviewProgressControllerTest`

MockMvc 测试：
- `GET /{id}/progress` 返回当前 `progress_json` 反序列化的 VO
- `GET /{id}/progress` 当 record 不存在 → 404
- `GET /{id}/progress/stream` 返回 `text/event-stream`，先推 SNAPSHOT 事件
- 权限：非 ADMIN/ROOT_ADMIN → 403

Mock：`ReviewProgressStore`、`ReviewProgressSseRegistry`

### 7.5 `ReviewOrchestratorTest`（扩展）

新增测试：
- `execute_publishesProgressInOrder`：4 维度全 mock 正常返回，验证 `progressStore.initProgress` → 4×`dimensionDone` → `judgeDone` 调用顺序（InOrder 验证）
- `execute_dimensionExceptionStillPublishesDone`：1 个 agent 抛异常，验证仍调用 `dimensionDone`（verdict=FAIL）+ `send`，且其他维度不受影响
- `execute_finalJsonUnaffectedByProgressFailure`：`progressStore.dimensionDone` 抛异常时，`aggregator.build` 仍正常返回（验证 try-catch 兜底）

Mock：`ReviewProgressStore`、`ReviewProgressSseRegistry`（新增 mock 依赖）

### 7.6 `ReviewServiceImplIntegrationTest`（扩展）

新增测试：
- `triggerReview_writesProgressJsonAndFinishes`：完整流程跑完，验证 `progress_json` 字段含 finishedAt + finalStatus
- `triggerReview_finishedEventReflectsRecordStatus`：验证 FINISHED 事件 payload 的 finalStatus 与 record 落库的 status 一致

### 7.7 TDD 执行顺序

按依赖关系从底层到上层：

1. `ReviewProgressStoreTest` → 实现 `ReviewProgressStore`
2. `ReviewProgressSseRegistryTest` → 实现 `ReviewProgressSseRegistry`
3. `AdminReviewProgressControllerTest` → 实现控制器 + `ReviewProgressVO` + `ProgressEvent`
4. 扩展 `ReviewOrchestratorTest` → 改 `ReviewOrchestrator`
5. 扩展 `ReviewServiceImplIntegrationTest` → 改 `ReviewServiceImpl`
6. 改造 `AdminAuthenticationFilter` 支持 query token（单独测试）

### 7.8 不测的部分

- 不测真实 LLM 调用（DashScope）
- 不测真实 SSE 网络传输（MockMvc 足够）
- 不测 `ReviewScheduleJob` 重启场景（6.3 已说明复用现有逻辑）
- 不测 4 个具体维度 Agent（已有测试覆盖）

### 7.9 现有测试不受影响

- 27 个 AI 模块测试全部保留
- `ReviewOrchestratorTest` 3 个已有测试需调整构造器（新增 2 个依赖），但断言不变
- `ReviewServiceImplIntegrationTest` 1 个已有测试需调整构造器（新增 2 个依赖），但断言不变

---

## 8. 实施清单

### 8.1 文件清单

#### 新增文件（8 个）

| # | 路径 | 类型 |
|---|------|------|
| 1 | `src/main/java/com/son/auramix/ai/progress/ReviewProgressStore.java` | @Component |
| 2 | `src/main/java/com/son/auramix/ai/progress/ReviewProgressSseRegistry.java` | @Component |
| 3 | `src/main/java/com/son/auramix/ai/progress/ProgressEvent.java` | DTO + 工厂 |
| 4 | `src/main/java/com/son/auramix/ai/progress/ReviewProgressVO.java` | VO |
| 5 | `src/main/java/com/son/auramix/controller/admin/AdminReviewProgressController.java` | @RestController |
| 6 | `src/test/java/com/son/auramix/ai/progress/ReviewProgressStoreTest.java` | Test |
| 7 | `src/test/java/com/son/auramix/ai/progress/ReviewProgressSseRegistryTest.java` | Test |
| 8 | `src/test/java/com/son/auramix/controller/admin/AdminReviewProgressControllerTest.java` | Test |

#### 修改文件（6 个）

| # | 路径 | 改动 |
|---|------|------|
| 1 | `src/main/java/com/son/auramix/domain/entity/TrackReviewRecord.java` | +1 字段 `progressJson` |
| 2 | `src/main/java/com/son/auramix/ai/orchestrator/ReviewOrchestrator.java` | +2 依赖，+recordId 参数，4 处进度调用 |
| 3 | `src/main/java/com/son/auramix/service/admin/impl/ReviewServiceImpl.java` | +2 依赖，initProgress/finished 调用 |
| 4 | `src/main/java/com/son/auramix/security/admin/AdminAuthenticationFilter.java` | 支持 query token 回退 |
| 5 | `src/test/java/com/son/auramix/ai/orchestrator/ReviewOrchestratorTest.java` | 构造器 +2 mock，新增 3 个测试 |
| 6 | `src/test/java/com/son/auramix/service/admin/impl/ReviewServiceImplIntegrationTest.java` | 构造器 +2 依赖，新增 2 个测试 |

#### DDL（1 条）

见 `2026-06-29-ai-review-visualization-ddl.sql`。

### 8.2 新增包结构

```
com.son.auramix.ai
  ├─ agent/        (已有)
  ├─ aggregator/   (已有)
  ├─ config/       (已有)
  ├─ dto/          (已有)
  ├─ lyrics/       (已有)
  ├─ orchestrator/ (已有)
  └─ progress/     ← 新增
       ├─ ReviewProgressStore.java
       ├─ ReviewProgressSseRegistry.java
       ├─ ProgressEvent.java
       └─ ReviewProgressVO.java
```

### 8.3 任务分解（12 个 Task）

| # | Task | TDD | 依赖 |
|---|------|-----|------|
| 1 | DDL：加 progress_json 字段 + 实体类 | 否 | - |
| 2 | `ReviewProgressVO` + `ProgressEvent` DTO | 否 | - |
| 3 | TDD `ReviewProgressStore` | 是 | 1, 2 |
| 4 | TDD `ReviewProgressSseRegistry` | 是 | 2 |
| 5 | `AdminReviewProgressController` + 快照端点 | 是 | 3, 4 |
| 6 | TDD `ReviewOrchestrator` 进度集成 | 是 | 3, 4 |
| 7 | TDD `ReviewServiceImpl` 进度集成 | 是 | 6 |
| 8 | 改造 `AdminAuthenticationFilter` query token | 是 | - |
| 9 | SSE 端点 + SNAPSHOT 补偿 | 是 | 5, 8 |
| 10 | DDL 验证 + 实体字段映射验证 | 否 | 1 |
| 11 | 完整构建验证 | 否 | 全部 |
| 12 | 提交 + 文档 | 否 | 11 |

### 8.4 关键接口签名

#### `ReviewProgressStore`

```java
void initProgress(Long recordId, Long trackId, String trackTitle, List<DimensionAgent> sortedAgents);
void dimensionDone(Long recordId, AgentResult result);
void judgeDone(Long recordId, AgentResult judgeResult);
void finished(Long recordId, Integer finalStatus, Integer finalVerdict, Integer finalConfidence);
ReviewProgressVO snapshot(Long recordId);
```

#### `ReviewProgressSseRegistry`

```java
SseEmitter subscribe(Long recordId);
void send(Long recordId, ReviewProgressVO payload);
void complete(Long recordId);
```

#### `ProgressEvent`

```java
public static ReviewProgressVO started(Long recordId, Long trackId, String trackTitle, List<DimensionAgent> agents);
public static ReviewProgressVO dimensionDone(Long recordId, Long trackId, AgentResult r);
public static ReviewProgressVO judgeDone(Long recordId, Long trackId, AgentResult r);
public static ReviewProgressVO finished(Long recordId, Long trackId, Integer finalStatus, Integer finalVerdict, Integer finalConfidence);
public static ReviewProgressVO snapshot(Long recordId, ReviewProgressVO fullState);
```

#### `AdminReviewProgressController`

```java
@GetMapping("/{id}/progress")
Result<ReviewProgressVO> getProgress(@PathVariable Long id);

@GetMapping(value = "/{id}/progress/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
SseEmitter streamProgress(@PathVariable Long id, @RequestParam(required = false) String token);
```

### 8.5 不做的事

- 不改 `ReviewListItemVO`（列表页只用 status）
- 不改 `AgentResultsAggregator` / `AgentResultsFormatter`
- 不改 4 个具体维度 Agent
- 不改 `ReviewScheduleJob`
- 不改 `ReviewJudgeAgent`
- 不引入 Spring WebSocket / STOMP
- 不引入新 ORM Mapper（用现有 `TrackReviewRecordMapper` + LambdaUpdateWrapper）
- 不引入 Redis 缓存进度
- 不改 `ReviewOrchestrator` 的 4 维度并行执行策略

### 8.6 风险与回滚

- **风险 1**：`AdminAuthenticationFilter` 改造可能影响现有接口鉴权
  - 缓解：只在 `/api/admin/manage/reviews/*/progress/stream` 路径开启 query token 回退，其他路径仍只认 Header
  - 回滚：还原 Filter 即可，progress_json 字段保留无害
- **风险 2**：SSE 长连占用 servlet 容器线程
  - 缓解：Spring MVC 的 `SseEmitter` 是异步的，不阻塞请求线程；embedded Tomcat 默认 maxConnections 通常足够
  - 回滚：禁用 SSE 端点，保留同步快照接口
- **风险 3**：progress_json 写库失败影响主流程
  - 缓解：6.5 已说明 try-catch 吞掉，主流程不阻塞
  - 回滚：orchestrator 的进度调用失败不影响 agent_results 落库

---

## 9. 与已有 spec 的关系

- `2026-06-26-ai-content-review-design.md`：原始 AI 审核接口文档
- `2026-06-28-ai-review-optimization-design.md`：基础优化（Prompt 强化 + 维度并行 + 结构化汇总）—— 已完成
- `2026-06-29-ai-review-visualization-design.md`：本次可视化 —— 基于前者成果扩展

三者不冲突：本次不改 4 维度 Agent、不改 aggregator、不改 formatter、不改现有接口。
