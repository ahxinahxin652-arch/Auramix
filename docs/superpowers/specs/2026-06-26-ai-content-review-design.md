# AI 内容审核工作流设计文档

> 日期: 2026-06-26
> 状态: 已确认

## 1. 概述

### 1.1 目标

为 Auramix 音乐流媒体平台设计 AI 内容审核工作流,对不符合社会价值观念、传播非主流思想、反社会反人类等不合理歌曲内容进行自动化审核。

### 1.2 核心规则

- 多维度 AI agent 流水线审核(政治敏感 / 暴力恐怖 / 色情低俗 / 反社会反人类)
- 最终裁决包含置信度判断(0-100)
- 置信度 ≥ 80:第二天 05:00 定时任务自动处理
- 置信度 < 80:等待管理员人工确认
- 审核不通过的歌曲返回结果中包含各维度不通过原因
- 审核通过的歌曲由定时任务更新状态为正常

### 1.3 技术选型

- Spring AI Alibaba (DashScope) + 通义千问 Qwen
- 流水线式工作流编排
- 串行执行 4 维度 agent → 裁决 agent 汇总

---

## 2. 架构设计

### 2.1 新增包结构

```
com.son.auramix
├── ai                                   ← 新增
│   ├── config/
│   │   └── AiConfig.java                — 5 个 ChatClient bean 定义
│   ├── agent/
│   │   ├── ReviewAgent.java              — Agent 统一接口(扩展性预留)
│   │   ├── PoliticalSensitivityAgent.java
│   │   ├── ViolenceTerrorAgent.java
│   │   ├── ExplicitContentAgent.java
│   │   ├── AntiSocialAgent.java
│   │   └── ReviewJudgeAgent.java         — 最终裁决 agent
│   ├── dto/
│   │   ├── AgentResult.java              — 单 agent 输出(verdict/confidence/reason)
│   │   └── ReviewContext.java            — 流水线上下文(歌词/标题/歌手/专辑)
│   ├── orchestrator/
│   │   └── ReviewOrchestrator.java       — 流水线编排
│   └── lyrics/
│       └── LyricsFetcher.java            — 拉取 lyrics_url 并缓存到审核记录
├── domain/entity/
│   └── TrackReviewRecord.java            ← 新增实体
├── mapper/
│   └── TrackReviewRecordMapper.java      ← 新增
├── service/admin/
│   ├── ReviewService.java                ← 新增接口
│   ├── impl/ReviewServiceImpl.java       ← 新增实现
│   └── impl/TrackServiceImpl.java        ← 修改:create/update 后触发审核
├── controller/admin/
│   └── AdminReviewController.java        ← 新增:人工复核队列接口
├── domain/dto/admin/
│   └── ReviewConfirmDTO.java             ← 新增
├── domain/vo/admin/
│   └── ReviewListItemVO.java             ← 新增
└── job                                   ← 新增
    └── ReviewScheduleJob.java            — @Scheduled cron 05:00
```

### 2.2 分层依赖关系

```
TrackServiceImpl ──触发──► ReviewService ──编排──► ReviewOrchestrator
                                                          │
                                          ┌───────────────┼───────────────┐
                                          ▼               ▼               ▼
                                   PoliticalSensitivity  ViolenceTerror  ExplicitContent
                                  Agent                  Agent            Agent
                                          │               │               │
                                          └───────┬───────┘               │
                                                  ▼                       │
                                           AntiSocialAgent               │
                                                  │                       │
                                                  ▼                       │
                                           ReviewJudgeAgent ◄────────────┘
                                                  │
                                                  ▼
                                          TrackReviewRecord (DB)
                                                  │
                                          ReviewScheduleJob (05:00)
                                                  │
                                          AdminReviewController (人工复核)
```

### 2.3 关键设计决策

1. **5 个 ChatClient bean**: 每个 agent 一个独立 ChatClient,独立 system prompt + temperature
2. **ReviewOrchestrator 串行流水线**: 4 维度 agent 串行执行 → 裁决 agent 汇总,便于追踪
3. **TrackServiceImpl 解耦**: create/update 后调用 `ReviewService.triggerReview(trackId)`,`@Async` 异步执行
4. **审核记录表为中心**: 所有过程、agent 输出、人工确认都写入 `track_review_records`

---

## 3. Agent 维度划分

### 3.1 五个 Agent 定义

| # | Agent | 审核维度 | 关注点 |
|---|-------|---------|--------|
| 1 | PoliticalSensitivityAgent | 政治敏感 | 反国家、政治敏感、领土主权、领导人不当言论等 |
| 2 | ViolenceTerrorAgent | 暴力恐怖 | 宣扬暴力、恐怖主义、极端行为、血腥描写等 |
| 3 | ExplicitContentAgent | 色情低俗 | 色情、低俗、侮辱性语言、不良价值观等 |
| 4 | AntiSocialAgent | 反社会反人类 | 反社会、反人类、煽动仇恨、歧视言论、非主流思想等 |
| 5 | ReviewJudgeAgent | 最终裁决 | 汇总前 4 个 agent 结果,做最终置信度评估与裁决 |

每个维度 agent 收到**相同的 ReviewContext**(全量内容:歌词+标题+歌手名+专辑名),从各自维度审视。

### 3.2 流水线流程

```
ReviewContext (歌词 + 标题 + 歌手名 + 专辑名)
        │
        ├──► PoliticalSensitivityAgent  → AgentResult
        ├──► ViolenceTerrorAgent        → AgentResult
        ├──► ExplicitContentAgent       → AgentResult
        └──► AntiSocialAgent            → AgentResult
                    │
                    ▼ (4 个 AgentResult 汇总)
            ReviewJudgeAgent
                    │
                    ▼
            最终裁决: PASS/FAIL + 置信度 + 拼接理由
                    │
                    ▼
            TrackReviewRecord (DB)
```

### 3.3 裁决规则

- **一票否决**: 任一维度 agent 报 FAIL 则整体 FAIL
- **置信度**: 取 FAIL agent 中最低 confidence 作为整体置信度;若全 PASS 则取所有 agent 中最低 confidence
- **不通过理由**: 拼接所有 FAIL agent 的 reason

### 3.4 System Prompt 设计

每个审核维度 agent 共享相同输入格式,system prompt 不同:

**PoliticalSensitivityAgent 示例:**
```
你是音乐内容政治敏感审核专家。审核以下音乐内容的政治敏感维度:
- 反国家、颠覆国家政权言论
- 领土主权不当表述
- 政治领导人侮辱性言论
- 政治敏感事件不当评论

审核内容:
歌曲标题: {title}
歌手: {artists}
专辑: {album}
歌词: {lyrics}  (如无歌词则标注"无歌词,仅审核元信息")

以 JSON 输出: {"verdict":"PASS|FAIL","confidence":0-100,"reason":"..."}
```

**ReviewJudgeAgent:**
```
你是音乐内容审核终审裁决官。以下是 4 个维度审核 agent 的输出:
{agentResults JSON}

裁决规则:
- 一票否决:任一 agent 报 FAIL 则整体 FAIL
- 置信度:取 FAIL agent 中最低 confidence 作为整体置信度;若全 PASS 则取最低 confidence
- 不通过理由:拼接所有 FAIL agent 的 reason

以 JSON 输出:
{"verdict":"PASS|FAIL","confidence":0-100,"failReasons":"拼接理由"}
```

### 3.5 ChatClient 配置

- 审核维度 agent: temperature = 0.3(稳定性优先)
- 裁决 agent: temperature = 0.1(最严格)

---

## 4. 数据模型

### 4.1 新建表 `track_review_records`

```sql
CREATE TABLE `track_review_records` (
  `id`              BIGINT       NOT NULL PRIMARY KEY COMMENT '雪花算法唯一ID',
  `track_id`        BIGINT       NOT NULL COMMENT '关联单曲ID',
  -- 审核内容快照(入库一次,后续从表读,不重复拉取 lyrics_url)
  `track_title`     VARCHAR(255) NOT NULL COMMENT '审核时的歌曲标题快照',
  `artist_names`    VARCHAR(1000) NULL   COMMENT '审核时的歌手名快照(逗号分隔)',
  `album_title`     VARCHAR(255) NULL   COMMENT '审核时的专辑标题快照',
  `lyrics_content`  TEXT         NULL   COMMENT '拉取的 LRC 歌词文本快照',
  -- 审核结果
  `verdict`         INT          NOT NULL DEFAULT 0 COMMENT '裁决: 0=待审核, 1=通过, -1=不通过, -2=待人工确认',
  `confidence`      INT          NOT NULL DEFAULT 0 COMMENT '最终置信度 0-100',
  `fail_reasons`    TEXT         NULL   COMMENT '不通过原因(各 fail agent 拼接)',
  `agent_results`   TEXT         NULL   COMMENT '4+1 个 agent 的完整 JSON 输出',
  -- 状态流转
  `status`          INT          NOT NULL DEFAULT 0 COMMENT '处理状态: 0=AI审核中, 1=AI审核完成待自动处理, 2=已自动处理, 3=待人工确认, 4=人工已确认',
  -- 人工复核
  `admin_id`        BIGINT       NULL   COMMENT '人工确认的管理员ID',
  `admin_verdict`   INT          NULL   COMMENT '管理员裁决: 1=通过, -1=不通过',
  `admin_note`      VARCHAR(500) NULL   COMMENT '管理员备注',
  `reviewed_at`     DATETIME     NULL   COMMENT '管理员确认时间',
  -- 时间戳
  `created_at`      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY `track_review_records_track_id_idx` (`track_id`),
  KEY `track_review_records_status_idx` (`status`),
  KEY `track_review_records_verdict_idx` (`verdict`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

### 4.2 verdict 值定义

| 值 | 含义 |
|----|------|
| 0 | 待审核(刚创建,流水线尚未完成) |
| 1 | 通过 |
| -1 | 不通过 |
| -2 | 待人工确认(低置信度) |

### 4.3 status 值定义

| 值 | 含义 | 下一步动作 |
|----|------|-----------|
| 0 | AI 审核中 | 等待流水线完成 |
| 1 | AI 审核完成,待自动处理 | 定时任务 05:00 处理(高置信度) |
| 2 | 已自动处理 | 终态,Track.status 已变更 |
| 3 | 待人工确认 | 管理员在后台确认 |
| 4 | 人工已确认 | 终态,Track.status 已变更 |

### 4.4 Track.status 扩展

在现有 `0=正常, -1=已下架, -2=暂无版权` 基础上新增:

| 值 | 含义 |
|----|------|
| -3 | 待审核(AI 审核期间临时状态,隔离播放) |

### 4.5 状态流转图

```
创建/更新单曲
    │
    ▼
Track.status = -3 (待审核)
TrackReviewRecord.status = 0 (AI审核中)
    │
    ▼ AI 流水线完成
    │
    ├─ 高置信度(≥80) 且 PASS
    │   → verdict=1, status=1 (待自动处理)
    │   → 05:00 定时任务: Track.status=0, record.status=2
    │
    ├─ 高置信度(≥80) 且 FAIL
    │   → verdict=-1, status=1 (待自动处理)
    │   → 05:00 定时任务: Track.status=-1, record.status=2
    │
    └─ 低置信度(<80)
        → verdict=-2, status=3 (待人工确认)
        → 管理员确认 PASS: Track.status=0, record.status=4
        → 管理员确认 FAIL: Track.status=-1, record.status=4
```

---

## 5. 纯音乐/无歌词审核与扩展性

### 5.1 场景处理策略

| 场景 | lyricsContent 状态 | 审核行为 |
|------|-------------------|---------|
| 正常歌曲(有歌词) | 有文本内容 | 4 维度 agent 全量审核歌词+元信息 |
| 无歌词文件(lyrics_url 为 null/空) | null | 跳过歌词部分,仅审核元信息 |
| 纯音乐(歌词文件仅含时间标签) | 空或仅 `[ti:][ar:][00:00.00]` 等元标签 | 跳过歌词部分,仅审核元信息 |
| 歌词拉取失败 | null + failReasons 标注 | 跳过歌词部分,仅审核元信息 |

### 5.2 ReviewContext 新增字段

```java
@Data
@Builder
public class ReviewContext {
    private Long trackId;
    private String trackTitle;
    private String artistNames;
    private String albumTitle;
    private String lyricsContent;
    private boolean hasLyrics;     // 是否包含有效歌词内容
    private String reviewType;     // 审核类型标识,用于扩展
}
```

### 5.3 hasLyrics 判定逻辑

```java
/**
 * 判断歌词内容是否有效(非空且不仅仅是 LRC 元标签)
 */
private boolean hasValidLyrics(String content) {
    if (content == null || content.isBlank()) {
        return false;
    }
    // 移除所有 LRC 时间标签和元信息标签后判断是否有实际文本
    String stripped = content.replaceAll("\\[\\w+:.*?\\]", "")
                             .replaceAll("\\[\\d{2}:\\d{2}\\.?\\d*\\]", "")
                             .trim();
    return !stripped.isEmpty();
}
```

### 5.4 Agent 执行逻辑

- 所有维度 agent **始终执行**,不跳过
- 每个 agent 在构建 prompt 时判断 `hasLyrics`:
  - `hasLyrics=true`: prompt 包含歌词全文
  - `hasLyrics=false`: prompt 标注"无歌词,仅审核元信息"
- 元信息(标题/歌手/专辑)仍需全维度审核
- agent 输出的 reason 中自然体现"仅基于元信息判断"

### 5.5 扩展性设计 — 为音频审核预留

#### ReviewAgent 统一接口

```java
public interface ReviewAgent {
    String getName();
    boolean supports(String reviewType);
    AgentResult review(ReviewContext ctx);
}
```

#### reviewType 字段

当前固定 `"TEXT_ONLY"`,后续引入音频审核时可扩展为:
- `"TEXT_AUDIO"` — 文本+音频审核
- `"AUDIO_ONLY"` — 仅音频审核

#### 未来扩展方式

新增音频 agent 只需实现 `ReviewAgent` 接口并注册:

```java
@Component
public class AudioContentAgent implements ReviewAgent {
    @Override
    public boolean supports(String reviewType) {
        return "AUDIO_ONLY".equals(reviewType) || "TEXT_AUDIO".equals(reviewType);
    }
}
```

当前阶段仍用固定注入的 4+1 agent,接口已定义,未来切换成本低。

#### 表结构预留

当前不新增音频相关字段,但 `track_review_records` 表设计已考虑后续 ALTER TABLE 扩展(如 `audio_content_url`、`audio_features`)。

---

## 6. 服务层与接口设计

### 6.1 ReviewService 接口

```java
public interface ReviewService {
    void triggerReview(Long trackId);
    PageResult<ReviewListItemVO> listPending(Integer pageNum, Integer pageSize);
    void confirmReview(Long recordId, ReviewConfirmDTO dto, Long adminId);
}
```

### 6.2 ReviewServiceImpl 流程

**triggerReview(trackId)** — `@Async` 异步执行:

1. 查 Track + Album + Artists,构建审核内容快照
2. LyricsFetcher 拉取 lyrics_url → lyricsContent,判定 hasLyrics
3. 设置 Track.status = -3(待审核,隔离播放)
4. 构建 ReviewContext(reviewType = "TEXT_ONLY")
5. orchestrator.execute(ctx) → 最终 AgentResult
6. 写入 TrackReviewRecord:
   - confidence ≥ 80 → verdict=PASS/FAIL, status=1(待自动处理)
   - confidence < 80 → verdict=-2, status=3(待人工确认)

**listPending(pageNum, pageSize)**:
- 查询 status=3 的记录,分页返回

**confirmReview(recordId, dto, adminId)**:
1. 校验 record.status=3
2. 写入 admin_id / admin_verdict / admin_note / reviewed_at
3. 根据 admin_verdict 更新 Track.status:
   - 1(通过) → Track.status=0
   - -1(不通过) → Track.status=-1
4. 更新 record.status=4

### 6.3 AdminReviewController 接口

```
GET  /api/admin/manage/reviews/pending
     → 分页列表,需 ADMIN/ROOT_ADMIN 权限
     → 参数: pageNum, pageSize

POST /api/admin/manage/reviews/{id}/confirm
     → 管理员确认
     → body: ReviewConfirmDTO { adminVerdict: 1|-1, adminNote: String }
     → 从 token 提取 adminId
```

### 6.4 TrackServiceImpl 改动

在 `createTrack` 和 `updateTrack` 末尾调用:
```java
reviewService.triggerReview(t.getId());
```
triggerReview 是 `@Async`,不阻塞当前事务。

### 6.5 DTO / VO

**ReviewConfirmDTO:**
```java
@Data
public class ReviewConfirmDTO {
    @NotNull
    private Integer adminVerdict;  // 1=通过, -1=不通过
    private String adminNote;
}
```

**ReviewListItemVO:**
```java
@Data
public class ReviewListItemVO {
    private Long id;
    private Long trackId;
    private String trackTitle;
    private Integer verdict;
    private Integer confidence;
    private String failReasons;
    private LocalDateTime createdAt;
}
```

### 6.6 ResultCode 新增

```java
REVIEW_NOT_FOUND(421, "审核记录不存在"),
REVIEW_NOT_PENDING(422, "该审核记录不在待确认状态"),
REVIEW_ALREADY_PROCESSED(423, "该审核记录已被处理"),
```

---

## 7. 定时任务与歌词拉取

### 7.1 ReviewScheduleJob

```java
@Scheduled(cron = "0 0 5 * * ?")
public void processAutoReviewResults() {
    // 查询 status=1 (AI审核完成待自动处理) 的记录
    // 逐条处理:
    //   verdict=1 (PASS) → Track.status=0 (正常), record.status=2
    //   verdict=-1 (FAIL) → Track.status=-1 (已下架), record.status=2
}
```

### 7.2 歌词拉取

- **仅 triggerReview 时拉取一次**,存入 `TrackReviewRecord.lyricsContent`
- 后续人工复核、定时任务从表读取,不重复拉取
- 拉取失败时 lyricsContent=null,在 failReasons 中标注"歌词未获取"
- 拉取后通过 `hasValidLyrics()` 判断是否为有效歌词

### 7.3 异步线程池

```java
@Bean("reviewTaskExecutor")
public ThreadPoolTaskExecutor reviewTaskExecutor() {
    ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
    executor.setCorePoolSize(2);
    executor.setMaxPoolSize(4);
    executor.setQueueCapacity(50);
    executor.setThreadNamePrefix("review-");
    return executor;
}
```

### 7.4 启用注解

`AuramixApplication.java` 新增:
```java
@EnableScheduling
@EnableAsync
```

---

## 8. 依赖引入与配置

### 8.1 pom.xml 新增

```xml
<dependencyManagement>
    <dependencies>
        <dependency>
            <groupId>com.alibaba.cloud.ai</groupId>
            <artifactId>spring-ai-alibaba-bom</artifactId>
            <version>1.0.0</version>
            <type>pom</type>
            <scope>import</scope>
        </dependency>
    </dependencies>
</dependencyManagement>

<dependency>
    <groupId>com.alibaba.cloud.ai</groupId>
    <artifactId>spring-ai-alibaba-starter-dashscope</artifactId>
</dependency>
```

### 8.2 application.yaml 新增

```yaml
spring:
  ai:
    dashscope:
      api-key: ${DASHSCOPE_API_KEY}
      model: qwen-plus
      chat:
        options:
          temperature: 0.3
```

### 8.3 环境变量

```bash
export DASHSCOPE_API_KEY=sk-xxxxxxxxxxxxxxxx
```

未设置时 ChatClient bean 创建失败,Spring Boot 启动即报错(fail-fast)。

### 8.4 数据库迁移

新建 `track_review_records` 表 DDL 追加到 schema 文件。Track.status 新增 -3 语义仅是约定,无需 DDL 变更。

---

## 9. 错误处理与测试策略

### 9.1 错误处理分级

| 层级 | 场景 | 处理方式 |
|------|------|---------|
| Agent 调用层 | Qwen API 超时/限流/网络异常 | agent 返回 `FAIL, confidence=0, reason="agent调用异常"`,流水线不中断 |
| Agent 输出层 | JSON 解析失败 | 记录原始响应,返回 `FAIL, confidence=0, reason="agent输出格式异常"` |
| 裁决层 | ReviewJudgeAgent 异常 | 降级为 `verdict=-2, confidence=0`,进入人工复核队列 |
| 歌词拉取层 | lyrics_url 不可达/404 | lyricsContent=null,仅审核元信息,failReasons 标注 |
| 异步任务层 | triggerReview 整体异常 | 记录错误日志,Track.status 保持 -3,审核记录 status=0 |
| 定时任务层 | 单条记录处理异常 | try-catch 单条,跳过异常记录继续处理 |
| 人工复核层 | record.status≠3 | 抛 BusinessException(REVIEW_NOT_PENDING) |
| 人工复核层 | record 不存在 | 抛 BusinessException(REVIEW_NOT_FOUND) |

### 9.2 日志规范

```java
log.info("[AI审核] trackId={} agent={} 开始审核", trackId, agentName);
log.info("[AI审核] trackId={} agent={} 完成 verdict={} confidence={}", trackId, agentName, verdict, confidence);
log.error("[AI审核] trackId={} agent={} 异常", trackId, agentName, e);
log.info("[AI审核] trackId={} 最终裁决 verdict={} confidence={} status={}", trackId, verdict, confidence, status);
log.info("[定时审核] 开始处理 {} 条待自动处理记录", pending.size());
log.info("[定时审核] trackId={} 自动处理完成 Track.status={}", trackId, trackStatus);
```

### 9.3 测试策略

| 测试类型 | 范围 | 方法 |
|---------|------|------|
| Agent 单元测试 | JSON 解析逻辑 | Mock ChatClient 返回固定 JSON,验证 AgentResult 解析 |
| Orchestrator 单元测试 | 流水线编排与汇总 | Mock 5 个 agent,验证一票否决/最低置信度 |
| ReviewService 单元测试 | triggerReview / confirmReview | Mock mapper 和 orchestrator,验证状态流转 |
| LyricsFetcher 单元测试 | 拉取与 hasValidLyrics 判定 | Mock HttpUtil,验证正常/超时/404/纯标签 |
| 定时任务测试 | ReviewScheduleJob | Mock mapper,验证批量处理逻辑 |
| Controller 集成测试 | 人工复核接口 | MockMvc + Spring Security Test |
| Agent Prompt 测试(手动) | 真实 Qwen API | 3 组测试数据(明显通过/明显违规/模糊边界) |

### 9.4 边界情况覆盖

- lyrics_url 为 null → 仅审核元信息
- 歌词文件为空字符串 → 仅审核元信息
- 歌词仅含 LRC 时间标签 → 视为无歌词,仅审核元信息
- 所有 agent 全 PASS → verdict=PASS, confidence=最低值
- 多个 agent FAIL → 拼接所有 fail reason
- confidence 恰好 = 80 → 按高置信度处理(自动)
- 定时任务无待处理记录 → 正常空跑

---

## 10. 设计总结

| 维度 | 决策 |
|------|------|
| 审核对象 | 歌词 + 标题 + 歌手名 + 专辑名 |
| 触发时机 | 创建/更新单曲时异步触发 |
| Agent 拆分 | 4 维度(政治/暴力/色低/反社会) + 1 裁决 |
| 模型 | Qwen (qwen-plus),Spring AI Alibaba DashScope |
| 裁决规则 | 一票否决 + 最低置信度 |
| 阈值 | ≥80 自动处理,< 80 人工复核 |
| 定时任务 | 每天 05:00 处理高置信度记录 |
| 持久化 | track_review_records 表 |
| 播放隔离 | 审核期间 Track.status=-3 |
| 歌词拉取 | 入库一次,后续从表读 |
| API Key | 环境变量 DASHSCOPE_API_KEY |
| 人工复核 | 后台 pending 列表 + confirm 接口 |
| 无歌词/纯音乐 | hasLyrics=false,agent 调整审核范围,仅审元信息 |
| 扩展性 | ReviewAgent 接口 + reviewType 字段,预留音频审核 |
