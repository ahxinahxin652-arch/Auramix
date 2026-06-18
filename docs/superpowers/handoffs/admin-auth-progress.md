# Auramix 管理员认证 — 子代理驱动开发 交接文档

> 写于 2026-06-18，由当前 session 结尾创建，供后续 session 续接使用。

## 0. 一句话现状

计划文件 `docs/superpowers/plans/2026-06-18-admin-auth.md` 共 24 个 TDD 任务。本 session 已 **完整完成 3 个**（Tasks 1-3），**实现+清理完成但 review 未跑 1 个**（Task 4），**未开始 20 个**（Tasks 5-24）。实现层代码已落到 `master` 分支，5 个新 commit + 1 个清理 commit。

## 1. 已完成提交

```
6eecf9d chore: 从 commit 中移除误提交的 javac -d 调试产物       <-- 清理 Task 4 产物
f11b74b feat(admin): ResultCode 新增 10 个管理员相关错误码       <-- Task 4 主体
30d7d38 feat(admin): 新增 Admin 实体(IdType.AUTO)与 AdminMapper  <-- Task 3
1612a69 build: 引入 spring-boot-starter-security 与 spring-security-test  <-- Task 2
3e03001 style(admin): 给 DDL 文件添加末尾换行符                  <-- Task 1 收尾
9b7e9fb feat(admin): 在 DDL 内联 admin 表新增 is_root 列          <-- Task 1 主体
06e951e docs(admin): 编写管理员认证与管理实施计划                 <-- 计划（前置）
87e0ba4 docs: add admin auth & management design spec            <-- 规格（前置）
```

**全部 6 个任务相关 commit 已 spec 审查 + code quality 审查并通过（Task 4 除外）。**

## 2. 任务级状态

| # | 任务 | 状态 | 提交 | 备注 |
|---|---|---|---|---|
| 1 | DDL 增 is_root 列 | ✅ 完成 | 9b7e9fb + 3e03001 | 提交时扫入了用户 pre-existing 的 `create database` / `use auramix` / `DROP admin` 行（这是 commit 前用户工作区已有的内容，非 implementer 改的；spec reviewer 提出后经判断为用户预存工作，未触动） |
| 2 | pom.xml 加 Spring Security | ✅ 完成 | 1612a69 | 两个依赖：`spring-boot-starter-security`（compile）+ `spring-security-test`（test） |
| 3 | Admin 实体 + Mapper | ✅ 完成 | 30d7d38 | `Integer id` + `IdType.AUTO`；`isRoot` 字段无 `@TableField`（依赖默认 snake_case 映射） |
| 4 | ResultCode +10 错误码 | ⚠️ 实现已落地，**review 未跑** | f11b74b + 6eecf9d | 见 §4 子项目 1 |
| 5 | AdminSessionInfo | ⏳ 待办 | — | |
| 6 | AdminTokenStore (TDD) | ⏳ 待办 | — | |
| 7 | 7 个 DTO | ⏳ 待办 | — | |
| 8 | AdminUserDetails | ⏳ 待办 | — | |
| 9 | AdminUserDetailsService (TDD) | ⏳ 待办 | — | |
| 10 | AdminAuthenticationFilter | ⏳ 待办 | — | |
| 11 | 401/403 处理器 | ⏳ 待办 | — | |
| 12 | SecurityConfig | ⏳ 待办 | — | |
| 13 | AdminAuthService (TDD) | ⏳ 待办 | — | |
| 14 | AdminManageService (TDD) | ⏳ 待办 | — | |
| 15 | AdminAuthController | ⏳ 待办 | — | |
| 16 | AdminManageController | ⏳ 待办 | — | |
| 17 | AdminBootstrapRunner (TDD) | ⏳ 待办 | — | |
| 18 | application.yaml 配置 | ⏳ 待办 | — | |
| 19 | Filter 切片测试 | ⏳ 待办 | — | |
| 20 | AuthController Web 切片测试 | ⏳ 待办 | — | |
| 21 | ManageController Web 切片测试 | ⏳ 待办 | — | |
| 22 | Auth 集成测试 | ⏳ 待办 | — | |
| 23 | Manage + Self 集成测试 | ⏳ 待办 | — | |
| 24 | 全量测试 + 冒烟 | ⏳ 待办 | — | |

TaskList ID 映射：本 session 跟踪用的 TaskCreate ID 与计划任务号 1:1 对应但数字乱序（#19 = Task 4，#20 = Task 2，#21 = Task 3，#38 = Task 1，#39-#42 = Tasks 5/6/8/9，#22-#37 = Tasks 11-24 散落在 ID 池里）。**新 session 应直接读计划文件，不要依赖 TaskList ID 顺序。**

## 3. 下个 session 应当做什么

### 3.1 起步读这三个文件
1. **本交接文件**（`docs/superpowers/handoffs/admin-auth-progress.md`）— 本文件
2. **计划**（`docs/superpowers/plans/2026-06-18-admin-auth.md`）— 24 个 TDD 任务全在这里
3. **规格**（`docs/superpowers/specs/2026-06-18-admin-auth-design.md`）— 12 节设计文档，是任务的真值来源

### 3.2 第一个动作：跑完 Task 4 的 review

Task 4 的实现已落地但 spec/code quality review 未跑。在新 session 起手时先 dispatch 两个 reviewer：

- spec reviewer：commit `f11b74b`（含 `ResultCode.java` 的 10 个枚举值），参照规格 §7 错误码表 + 计划 Task 4 验证是否完全对应
- code quality reviewer：同上 commit

预期：APPROVED。注意 §4 子项目 1 中描述的两个 implementer 主动决策，需要让 reviewer 知道。

完成后把 TaskList 中 #19 标 completed。

### 3.3 续接 Task 5

Task 5 是 `AdminSessionInfo` 值对象（service/admin/ 包内），是后续 Task 6（AdminTokenStore）的基础。按计划 Task 5 内容 dispatch 即可。

后续 Tasks 5→6→7→8→9→10→11→12→13→14→15→16→17→18→19→20→21→22→23→24 严格按计划顺序执行（spec/code review 仍按 subagent-driven-development skill 规定每任务两次 review）。

## 4. 子项目记录（implementer 主动决策，避免下次踩坑）

### 4.1 Task 4 计划本身有内部矛盾

计划 Task 4 的"Step 1" 要求：
- "在 `SERVICE_UNAVAILABLE` 之后追加以下枚举值"
- "Do NOT change the existing 9 enum values"

但同时给出的"最终 shape"代码块在 `SERVICE_UNAVAILABLE(5001, "服务暂不可用");` 之后还有 10 个新枚举值——Java 语法上这是编译错误（`;` 表示枚举常量列表终结）。

**Implementer 决策**：将 `SERVICE_UNAVAILABLE` 后的 `;` 改为 `,`（纯标点修正，非值变更），新最后一行 `ADMIN_ENABLE_NOT_SUPPORTED(4005, "当前不支持启用账号");` 持有终结 `;`。两个 review 阶段都尚未对此决策做正式签收。

下次 dispatch Task 4 review 时，需在 prompt 中明确告知该标点修正，**不要让 reviewer 把它判成违规**。

### 4.2 Task 4 误提交了 javac `-d` 调试产物文件

Implementer 在调试编译错误时执行了 `javac -d /tmp/...`，在 Windows 上意外在工作区根目录创建了一个名为 `-d` 的文件（152 字节），并被 `git add src/.../ResultCode.java` 一起带入 commit f11b74b。

**已在 commit 6eecf9d 用 `git rm -- "-d"` 删除。** 这是为什么 f11b74b 不是 Task 4 的最终 commit。

下次 dispatch Task 4 spec/code reviewer 时，**评审范围应包括 `f11b74b` + `6eecf9d` 两个 commit**（视为一个逻辑变更单元），不要单独评审 f11b74b（会看到 -d 文件还在）。

### 4.3 实施环境注意

- **Maven**：`D:/BaseApp/apache-maven-3.9.8/bin/mvn`
- **JDK**：项目要 21。本机默认 JDK 17 会在 maven wrapper 处报 `JAVA_HOME` 错。**用 export `JAVA_HOME=D:/Program Files/Java/jdk-21`**
- **PATH 技巧**：Windows Git-Bash 下 maven wrapper 需要 `uname`/`dirname`，要 `export PATH="/usr/bin:$PATH"`（或前置）
- **Edit 工具优先**：pom.xml 改动必须用 Edit 工具，不要 sed/awk
- **计划自审矛盾**：实施时遇到计划/规格内部矛盾，按规格的精神而非死字面做最小修正，并在 commit message 或 DONE_WITH_CONCERNS 中说明

### 4.4 提交 message 规范

本项目约定（已建立）：
- DDL / 数据：`feat(admin): ...`
- 构建依赖：`build: ...`
- 实体 / service / controller：`feat(admin): ...`
- 文档 / 计划：`docs(admin): ...`
- 样式修复：`style(admin): ...`
- 重构：`refactor(admin): ...`
- 杂项清理：`chore: ...`

Subagent 严格按计划给出的 commit message 拼写，不要自行发挥。

## 5. 计划/规格中存在的小不一致（已绕过，无需下次纠结）

1. **spec §3 用 `ALTER TABLE ... AFTER status`，但计划 Task 1 把 is_root 放在 status 之前**。两者都正确（DDL 是重建而非 ALTER），实施按计划。已 commit 落地。
2. **计划文件结构图（§ 文件结构）声明 `service/admin/AdminSessionInfo.java`，但 `AdminSessionInfo` 严格说是值对象而非 service**。Task 5 计划文本里放在了 `service/admin/` 包。**沿用计划**。

## 6. 自检清单

新 session 起手时跑一遍：
```bash
cd 'C:/Users/17599/Desktop/Auramix/Auramix'
git log --oneline -10             # 期望见 §1 的 8 个 commit
git status --short                # 期望只有 .claude/settings.local.json (M) + target/ (??)
ls src/main/java/com/son/auramix/entity/Admin.java          # 存在
ls src/main/java/com/son/auramix/mapper/AdminMapper.java    # 存在
grep -c "ADMIN_BAD_CREDENTIALS" src/main/java/com/son/auramix/common/result/ResultCode.java   # =1
ls -- "-d" 2>&1                    # 期望 "No such file or directory"
```

确认 6 项都对得上后再开始 Task 4 review。
