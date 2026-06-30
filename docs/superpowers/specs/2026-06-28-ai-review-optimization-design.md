# AI 审核模块优化设计文档

> 日期: 2026-06-28
> 状态: 已确认
> 范围: AI 歌曲审核实现优化（Prompt 强化 + 维度并行 + 架构可扩展 + 结构化汇总 + 管理员端维度明细）

---

## 1. 概述

### 1.1 背景

`docs/AI审核接口文档.md` 已定义 4 维度 Agent + 1 裁决 Agent 的流水线架构。当前的 `com.son.auramix.ai` 包实现基本满足文档要求，但存在以下不足：

- **审核准确度**：`AbstractDimensionAgent.buildPrompt` 是通用模板，没有把各维度的"具体审查点"显式列在 user prompt 里，LLM 仅依赖 ChatClient 的 system prompt 决定审核粒度。
- **执行性能**：4 维度 Agent 串行执行，单首歌审核耗时 ≈ 4×单次 LLM 时长。
- **架构可扩展性**：`ReviewOrchestrator` 显式注入 4 个 Agent，新增维度必须改编排器。
- **汇总字段**：`agent_results` JSON 只存维度详情和裁决，没有结构化的"每维度概览"。
- **管理员端可见性**：`GET /api/admin/manage/reviews/pending` 只回 `failReasons`（仅含 FAIL 维度），管理员看不到全量维度审核情况。

### 1.2 目标

在不破坏对外接口和数据库 schema 的前提下，一次性解决上述 5 个问题。

### 1.3 关键约束

- 不变更 4.1/4.2/4.3 状态值
- 不变更数据库 schema（`agent_results` 是 TEXT，新结构写进去即可）
- 不变更 REST 接口 5.1–5.7
- 不变更 4 维度 Agent 名称字符串（PoliticalSensitivity / ViolenceTerror / ExplicitContent / AntiSocial）
- 4 维度 Agent 类不删不重命名

---

## 2. 架构总览

### 2.1 数据流

```
                  ┌─────────────────────────────────────────────────────┐
                  │ ReviewServiceImpl.triggerReview(trackId)            │
                  │   (@Async reviewTaskExecutor)                        │
                  └───────────────────────────┬─────────────────────────┘
                                              │
                                              ▼
                  ┌─────────────────────────────────────────────────────┐
                  │ ReviewOrchestrator.execute(ctx)                      │
                  │                                                      │
                  │  1) 注入 List<DimensionAgent>（Spring 自动收集，按 @Order 排序）│
                  │  2) 4 维度 CompletableFuture.supplyAsync 并行         │
                  │  3) futures.stream().map(join).toList() 阻塞汇合       │
                  │  4) ReviewJudgeAgent.judge(ctx, dims) 串行裁决        │
                  │  5) AgentResultsAggregator.build → JSON 字符串       │
                  │  6) 返回 PipelineResult(dims, judge, json)            │
                  └───────────────────────────┬─────────────────────────┘
                                              │
                                              ▼
                  ┌─────────────────────────────────────────────────────┐
                  │ TrackReviewRecord.agent_results (TEXT)              │
                  │ + failReasons / confidence / verdict 字段不变        │
                  └─────────────────────────────────────────────────────┘
```

### 2.2 流水线时序

```
T0  triggerReview(trackId) 入口
 │
 ▼
T1  查 Track / Album / Artists（已有逻辑，不动）
T2  插入 TrackReviewRecord (status=0)
T3  拉歌词（已有逻辑，不动）
 │
 ▼
T4  ┌─ CompletableFuture #1: PoliticalSensitivityAgent.review(ctx) ─┐
    ├─ CompletableFuture #2: ViolenceTerrorAgent.review(ctx)        ─┤  并行
    ├─ CompletableFuture #3: ExplicitContentAgent.review(ctx)        ─┤
    └─ CompletableFuture #4: AntiSocialAgent.review(ctx)            ─┘
    (各 Agent 异常 → 返回 FAIL/0/"agent调用异常" 不污染其它维度)
 │
 ▼
T5  futures.stream().map(CompletableFuture::join).toList()  阻塞汇合（保留 @Order 顺序）
 │
 ▼
T6  ReviewJudgeAgent.judge(ctx, dims)   ← 串行(只 1 次 LLM)
 │
 ▼
T7  AgentResultsAggregator.build(dims, judge) → JSON 字符串（含 dimensionSummary）
 │
 ▼
T8  reviewRecordMapper.update(...)  (条件更新 status=0 → status=1/3)
```

---

## 3. 组件设计

### 3.1 新增包/文件

```
com.son.auramix.ai
├── agent/
│   ├── DimensionAgent.java                    ← 新增：维度 Agent 接口
│   ├── ReviewAgentSorter.java                 ← 新增：按 @Order 排序工具
│   ├── AbstractDimensionAgent.java            ← 修改：buildPrompt 模板化
│   ├── PoliticalSensitivityAgent.java         ← 小改：实现 DimensionAgent + getCriteria
│   ├── ViolenceTerrorAgent.java               ← 小改
│   ├── ExplicitContentAgent.java              ← 小改
│   ├── AntiSocialAgent.java                   ← 小改
│   └── ReviewJudgeAgent.java                  ← 不变
├── aggregator/                                ← 新增包
│   ├── AgentResultsAggregator.java            ← 新增：拼 agent_results JSON
│   └── AgentResultsFormatter.java             ← 新增：维度结果中文格式化（管理员端）
├── orchestrator/
│   └── ReviewOrchestrator.java                ← 重构：List<DimensionAgent> + 并行
├── dto/
│   ├── AgentResult.java                       ← 不变
│   ├── ReviewContext.java                     ← 不变
│   └── AgentResultsPayload.java               ← 新增：JSON 序列化 DTO
├── config/
│   └── AiConfig.java                          ← 不变
└── lyrics/
    └── LyricsFetcher.java                     ← 不变
```

### 3.2 新接口/类详细

#### `DimensionAgent.java`

```java
public interface DimensionAgent extends ReviewAgent {
    /**
     * 本维度具体的审核标准（条目化、清晰可枚举）
     * 将注入到 user prompt 的 "请从以下维度进行判断：" 部分
     */
    String getCriteria();
}
```

#### `AgentResultsAggregator.java`

```java
@Component
@RequiredArgsConstructor
public class AgentResultsAggregator {
    private final ObjectMapper objectMapper;  // Spring 注入项目统一的 ObjectMapper

    public String build(List<AgentResult> dimensions, AgentResult judge) {
        AgentResultsPayload payload = new AgentResultsPayload();
        payload.setDimensionSummary(buildSummary(dimensions));
        payload.setDimensions(dimensions);
        payload.setJudge(judge);
        return objectMapper.writeValueAsString(payload);
    }

    private List<DimensionSummary> buildSummary(List<AgentResult> dims) {
        return dims.stream()
            .map(d -> new DimensionSummary(d.getAgentName(), d.getVerdict(), d.getConfidence()))
            .toList();
    }
}
```

#### `AgentResultsFormatter.java`（管理员端维度明细）

```java
@Component
public class AgentResultsFormatter {
    private static final Map<String, String> CN_NAME = Map.of(
        "PoliticalSensitivity", "政治敏感",
        "ViolenceTerror",       "暴力恐怖",
        "ExplicitContent",      "色情低俗",
        "AntiSocial",           "反社会"
    );

    /**
     * 把 agent_results JSON 的 dimensions[] 渲染为中文明细
     * @return 形如 "政治敏感审核通过：置信度92；暴力恐怖审核未通过，疑是：xxx"
     *         若 agentResults 为空/解析失败/不含 dimensions，返回 null
     */
    public String formatDimensions(String agentResultsJson) { ... }
}
```

#### `AgentResultsPayload.java`

```java
@Data
public class AgentResultsPayload {
    private List<DimensionSummary> dimensionSummary;  // 新增：每维度 verdict/confidence 概览
    private List<AgentResult> dimensions;             // 完整 4 维度详情
    private AgentResult judge;                         // 裁决详情
}

@Data @AllArgsConstructor @NoArgsConstructor
public class DimensionSummary {
    private String agentName;
    private String verdict;
    private Integer confidence;
}
```

### 3.3 改动文件

#### `AbstractDimensionAgent.java`（修改 `buildPrompt` + 声明 implements DimensionAgent）

类签名必须是 `public abstract class AbstractDimensionAgent implements DimensionAgent`，
以保证 `buildPrompt` 内能直接调用 `getCriteria()`（来自 DimensionAgent 接口），
且 4 个维度 Agent 通过继承 AbstractDimensionAgent 自动满足 Spring 的 `List<DimensionAgent>` 注入契约。

```java
public abstract class AbstractDimensionAgent implements DimensionAgent {
    // ... 现有字段/构造 ...

    protected String buildPrompt(ReviewContext ctx) {
        StringBuilder sb = new StringBuilder();
        sb.append("请审核以下音乐内容：\n");
        sb.append("歌曲标题: ").append(ctx.getTrackTitle()).append("\n");
        sb.append("歌手: ").append(ctx.getArtistNames() != null ? ctx.getArtistNames() : "未知").append("\n");
        sb.append("专辑: ").append(ctx.getAlbumTitle() != null ? ctx.getAlbumTitle() : "未知").append("\n");
        if (ctx.isHasLyrics()) {
            sb.append("歌词: ").append(ctx.getLyricsContent()).append("\n");
        } else {
            sb.append("歌词: 无歌词，仅审核元信息\n");
        }
        sb.append("\n请从以下维度进行判断：\n");
        sb.append(getCriteria());   // ← 新增：调用子类的 getCriteria()
        sb.append("\n请严格审核，以JSON输出：{\"verdict\":\"PASS|FAIL\",\"confidence\":0-100,\"reason\":\"...\"}\n");
        sb.append("verdict为PASS时reason可为null。confidence为你的置信度(0-100整数)。");
        return sb.toString();
    }
}
```

#### 4 个维度 Agent（每个加 @Order + getCriteria）

```java
@Component
@Order(10)
public class PoliticalSensitivityAgent extends AbstractDimensionAgent implements DimensionAgent {
    public PoliticalSensitivityAgent(@Qualifier("politicalChatClient") ChatClient c) { super(c); }
    @Override public String getName() { return "PoliticalSensitivity"; }

    @Override
    public String getCriteria() {
        return "1) 反国家、颠覆国家政权言论\n" +
               "2) 领土主权不当表述\n" +
               "3) 政治领导人侮辱性言论\n" +
               "4) 政治敏感事件不当评论";
    }
}
```

```java
@Component
@Order(20)
public class ViolenceTerrorAgent extends AbstractDimensionAgent implements DimensionAgent {
    public ViolenceTerrorAgent(@Qualifier("violenceChatClient") ChatClient c) { super(c); }
    @Override public String getName() { return "ViolenceTerror"; }

    @Override
    public String getCriteria() {
        return "1) 宣扬暴力、恐怖主义\n" +
               "2) 极端行为、血腥描写\n" +
               "3) 煽动暴力冲突\n" +
               "4) 恐怖组织相关内容";
    }
}
```

```java
@Component
@Order(30)
public class ExplicitContentAgent extends AbstractDimensionAgent implements DimensionAgent {
    public ExplicitContentAgent(@Qualifier("explicitChatClient") ChatClient c) { super(c); }
    @Override public String getName() { return "ExplicitContent"; }

    @Override
    public String getCriteria() {
        return "1) 色情、低俗内容\n" +
               "2) 侮辱性语言\n" +
               "3) 不良价值观引导\n" +
               "4) 庸俗化表达";
    }
}
```

```java
@Component
@Order(40)
public class AntiSocialAgent extends AbstractDimensionAgent implements DimensionAgent {
    public AntiSocialAgent(@Qualifier("antiSocialChatClient") ChatClient c) { super(c); }
    @Override public String getName() { return "AntiSocial"; }

    @Override
    public String getCriteria() {
        return "1) 反社会、反人类言论\n" +
               "2) 煽动仇恨、歧视\n" +
               "3) 非主流思想、极端思想传播\n" +
               "4) 违背社会核心价值观";
    }
}
```

#### `ReviewOrchestrator.java`（重构核心）

```java
@Slf4j
@Component
@RequiredArgsConstructor
public class ReviewOrchestrator {

    private final List<DimensionAgent> dimensionAgents;   // Spring 自动注入（按 @Order 排序）
    private final ReviewJudgeAgent reviewJudgeAgent;
    private final AgentResultsAggregator aggregator;
    private final TaskExecutor reviewTaskExecutor;       // 复用 reviewTaskExecutor

    public PipelineResult execute(ReviewContext ctx) {
        log.info("[AI审核] trackId={} 流水线开始（4维度并行）", ctx.getTrackId());

        // 1) 4 维度并行
        List<CompletableFuture<AgentResult>> futures = dimensionAgents.stream()
            .map(agent -> CompletableFuture.supplyAsync(
                () -> {
                    AgentResult r = agent.review(ctx);
                    log.info("[AI审核] trackId={} agent={} 完成 verdict={} confidence={}",
                        ctx.getTrackId(), r.getAgentName(), r.getVerdict(), r.getConfidence());
                    return r;
                },
                reviewTaskExecutor))
            .toList();

        // 2) 汇合
        List<AgentResult> dims = futures.stream()
            .map(CompletableFuture::join)
            .toList();

        // 3) 裁决
        AgentResult judge = reviewJudgeAgent.judge(ctx, dims);
        log.info("[AI审核] trackId={} 最终裁决 verdict={} confidence={}",
            ctx.getTrackId(), judge.getVerdict(), judge.getConfidence());

        // 4) 聚合 JSON
        String agentResultsJson = aggregator.build(dims, judge);

        return new PipelineResult(dims, judge, agentResultsJson);
    }

    @Data @AllArgsConstructor
    public static class PipelineResult {
        private List<AgentResult> dimensionResults;
        private AgentResult finalResult;
        private String agentResultsJson;  // 新增：方便调用方直接使用
    }
}
```

`buildAgentResultsJson` 和 `escapeJson` 方法整体删除（迁出到 Aggregator）。

#### `ReviewListItemVO.java`（新增字段）

```java
@Data
public class ReviewListItemVO {
    private Long id;
    private Long trackId;
    private String trackTitle;
    private Integer verdict;
    private Integer confidence;
    private String failReasons;
    private Integer status;
    private LocalDateTime createdAt;

    /** 各维度审核明细（中文），如 "政治敏感审核通过：置信度92；暴力恐怖审核未通过，疑是：xxx" */
    private String dimensionDetails;  // ← 新增
}
```

#### `ReviewServiceImpl.java`（小改）

`listPending` 中增加一行：

```java
vo.setDimensionDetails(agentResultsFormatter.formatDimensions(r.getAgentResults()));
```

`triggerReview` 中：

```java
ReviewOrchestrator.PipelineResult pipeline = orchestrator.execute(ctx);
List<AgentResult> dimensionResults = pipeline.getDimensionResults();
AgentResult finalResult = pipeline.getFinalResult();
String agentResultsJson = pipeline.getAgentResultsJson();   // 直接用 Orchestrator 聚合好的
```

---

## 4. 数据格式

### 4.1 新 agent_results JSON 结构

```json
{
  "dimensionSummary": [
    {"agentName":"PoliticalSensitivity","verdict":"PASS","confidence":92},
    {"agentName":"ViolenceTerror","verdict":"PASS","confidence":88},
    {"agentName":"ExplicitContent","verdict":"FAIL","confidence":45},
    {"agentName":"AntiSocial","verdict":"PASS","confidence":85}
  ],
  "dimensions": [
    {"agentName":"PoliticalSensitivity","verdict":"PASS","confidence":92,"reason":null},
    {"agentName":"ViolenceTerror","verdict":"PASS","confidence":88,"reason":null},
    {"agentName":"ExplicitContent","verdict":"FAIL","confidence":45,"reason":"歌词中含粗俗表达"},
    {"agentName":"AntiSocial","verdict":"PASS","confidence":85,"reason":null}
  ],
  "judge": {
    "agentName":"ReviewJudge",
    "verdict":"FAIL",
    "confidence":45,
    "failReasons":"色情低俗: 歌词中含粗俗表达 (confidence=45)"
  }
}
```

### 4.2 5.6 接口响应（listPending）

```json
{
  "id": 5555555555555555555,
  "trackId": 1234567890123456789,
  "trackTitle": "示例歌曲",
  "verdict": -2,
  "confidence": 55,
  "failReasons": "反社会: 歌词含人身攻击 (confidence=45)",
  "dimensionDetails": "政治敏感审核通过：置信度92；暴力恐怖审核通过：置信度88；色情低俗审核通过：置信度85；反社会审核未通过，疑是：歌词中含对他人人身攻击的隐喻，涉及网络暴力与侮辱性语言",
  "status": 3,
  "createdAt": "2026-06-27T14:00:00"
}
```

---

## 5. 错误处理

| 场景 | 处理 |
|------|------|
| 单个 Agent LLM 调用异常 | AbstractDimensionAgent.review 内 try-catch → 返回 FAIL/0/"agent调用异常" |
| 单个 Agent LLM 返回非 JSON | parseResponse try-catch → 返回 FAIL/0/"agent输出格式异常" |
| 4 维度全部失败 | 仍能进入 judge 阶段；record.failReasons 由 judge 拼接 |
| 裁决 Agent 异常 | judge 内 try-catch → 返回 FAIL/0；triggerReview 顶层 catch 把 record.status 标 5 |
| 4 维度全异常 + judge 异常 | triggerReview 顶层 catch 处理；record.status 标 5，failReasons 覆盖为异常文本 |
| Aggregator JSON 序列化失败 | triggerReview 顶层 catch 兜底；返回原 agent_results 不变 |
| Formatter 解析 agent_results 失败 | 返回 null，前端做空判断 |
| 未知 agentName 出现在 dimensions | Formatter 沿用英文名，不抛错 |

---

## 6. 兼容性

| 兼容项 | 状态 |
|--------|------|
| 4 维度 Agent 名称字符串 | **不变** |
| 裁决规则（一票否决/取最低 confidence/拼接 failReasons） | **不变** |
| TrackReviewRecord 字段 | **不变**（agent_results 是 TEXT） |
| 对外 REST 接口 5.1–5.7 | **不变**（仅 5.6 响应新增 dimensionDetails 字段，向后兼容） |
| 已存在的状态值 | **不变** |
| agent_results JSON 旧结构 | **完全兼容**（dimensions 和 judge 字段都保留，只新增 dimensionSummary） |
| 旧记录（agent_results 为 null） | dimensionDetails 字段为 null，前端做空判断 |
| AiConfig.java（5 个 ChatClient） | **不变** |
| application.yml 线程池配置 | **不变** |
| 数据库 schema | **不变** |

---

## 7. 测试计划

### 7.1 单元测试

| 测试类 | 覆盖 |
|--------|------|
| `AbstractDimensionAgentTest` | Mock ChatClient：①正常 PASS ②正常 FAIL ③非 JSON ④抛异常 ⑤markdown 包裹 JSON |
| `ReviewOrchestratorTest` | Mock 4 DimensionAgent + 1 Judge：①并行汇合顺序符合 @Order ②单维度异常不影响其它 ③judge 输入 dims 顺序与 summary 一致 |
| `AgentResultsAggregatorTest` | ①输出 JSON 含 dimensionSummary/dimensions/judge ②dims 为空时 summary 是空数组 ③特殊字符（"\、\n）正确 escape |
| `PoliticalSensitivityAgentTest` 等 4 个 | getCriteria() 返回非空且 user prompt 包含 criteria |
| `ReviewAgentSorterTest` | 乱序 List 按 @Order 升序 |
| `AgentResultsFormatterTest` | ①全 PASS ②1 维 FAIL ③JSON 解析失败 ④未知 agentName fallback |

### 7.2 集成测试

`ReviewServiceImplIntegrationTest`（Mock ChatClient + 真实 Mapper）：
- ① 4 维度全 PASS，confidence=92 → record.status=1, verdict=1, agent_results 含 dimensionSummary
- ② 1 维度 FAIL，confidence=45 → record.status=3, verdict=-2
- ③ track 不存在 → log warn 跳过
- ④ 歌词 URL 拉取失败 → 走"无歌词"分支
- ⑤ listPending 返回的 dimensionDetails 非空且符合中文格式

### 7.3 手工验证

3 首歌接真 LLM：
- ① 抒情歌 → 4 维度全 PASS、confidence ≥ 80
- ② 含政治隐喻 → PoliticalSensitivity FAIL、其它 PASS
- ③ 含粗口 → ExplicitContent FAIL、其它 PASS

### 7.4 回归验证

- 创建一首歌 → 等 5 秒 → 查 track_review_records：agent_results 是合法 JSON、含 dimensionSummary
- 旧字段 verdict/confidence/failReasons/status 按既有规则更新
- /api/admin/manage/reviews/pending 仍能正确列出
- 管理员人工确认 → Track.status 仍按 verdict 切到 0/1

### 7.5 不做的事

- 不写 LLM 输出质量评测（人工对比）
- 不写并发压测
- 不做 Flyway 迁移

---

## 8. 实施清单（按顺序）

1. 新增 `AgentResultsPayload` / `DimensionSummary` DTO
2. 新增 `AgentResultsAggregator`（含 build() 方法）
3. 新增 `AgentResultsFormatter`（含 formatDimensions() 方法）
4. 新增 `DimensionAgent` 接口
5. 新增 `ReviewAgentSorter` 工具
6. 修改 4 个维度 Agent：加 `@Order` + `implements DimensionAgent` + `getCriteria()`
7. 修改 `AbstractDimensionAgent`：类签名加 `implements DimensionAgent` + `buildPrompt` 注入 `getCriteria()`
8. 重构 `ReviewOrchestrator`：注入 `List<DimensionAgent>` + CompletableFuture 并行 + 调用 Aggregator
9. 删除 `ReviewOrchestrator.buildAgentResultsJson` / `escapeJson`（已迁出）
10. 修改 `ReviewListItemVO`：加 `dimensionDetails` 字段
11. 修改 `ReviewServiceImpl.listPending`：注入 Formatter 并调用
12. 修改 `ReviewServiceImpl.triggerReview`：使用 pipeline.getAgentResultsJson()
13. 单元测试 6 个 + 集成测试 1 个
14. `mvn compile` 验证
15. `mvn test` 验证
16. 手工启动应用，跑回归验证
