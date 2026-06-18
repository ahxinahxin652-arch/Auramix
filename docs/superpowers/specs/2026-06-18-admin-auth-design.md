# Auramix 管理员认证与管理 - 设计文档

- 日期: 2026-06-18
- 状态: 已通过用户确认（4 节设计逐节确认）
- 范围: 管理员登录 + 初始管理员种子 + 初始管理员对其他管理员的 CRUD 子集

---

## 1. 背景与目标

`auramix_mysql_schema.sql` 已包含 `admin` 表。本设计在此基础上实现：

1. 首次启动时**自动创建初始管理员**（`is_root=1`）
2. 初始管理员可以**登录**
3. 初始管理员可以**创建其他管理员**（`is_root=0`）
4. 初始管理员可以**重置其他管理员的密码**
5. 初始管理员可以**停用其他管理员的账号**

非目标（YAGNI）：普通用户登录、审计日志表、登录限流、修改自身密码、启用被停用账号、管理员搜索过滤、HTTPS/CORS 加固。

---

## 2. 关键决策汇总

| 决策项 | 选择 | 备注 |
|---|---|---|
| 认证机制 | Redis 服务端 token | 项目已引入 Redis；可立即作废 |
| 安全框架 | 集成 Spring Security | 用 BCrypt / FilterChain / SecurityContext / `@PreAuthorize` |
| 凭据传输 | 自定义 token（非 JWT、非 session） | Spring Security 中 session 策略设为 `STATELESS` |
| 初始管理员标识 | 新增 `is_root` 字段 | 语义最清楚 |
| 初始管理员入库 | 启动时 `CommandLineRunner` 种子 | 密码从配置 / 环境变量读 |
| Token 有效期 | 滑动 2h | 每次请求续期 TTL |
| 重置密码语义 | 调用方传新明文密码 | 流程最简 |
| 停用语义 | `status=0` + 删除该账号所有 token | 立即踢人 |
| 重置密码是否踢人 | 是 | 旧密码作废即旧 token 失效 |
| 自我保护 | 初始管理员不可动；任何人不能动自己 | 防止误锁 |
| `admin.id` 策略 | `IdType.AUTO` 自增 | 沿用 DDL；不采用雪花（仅此表例外） |

---

## 3. Schema 变更

`auramix_mysql_schema.sql` 中 `admin` 表新增 `is_root` 列：

```sql
ALTER TABLE `admin`
  ADD COLUMN `is_root` TINYINT(1) NOT NULL DEFAULT 0
    COMMENT '是否初始管理员: 0否 1是'
  AFTER `status`;
```

修改后的 DDL 文件直接更新内联 DDL（第 263-277 行附近），不再保留单独迁移脚本。

---

## 4. 依赖

`pom.xml` 新增：

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-security</artifactId>
</dependency>
```

测试依赖：

```xml
<dependency>
    <groupId>org.springframework.security</groupId>
    <artifactId>spring-security-test</artifactId>
    <scope>test</scope>
</dependency>
```

不需要 jjwt、oauth2-resource-server、jjwt-api 等。BCrypt 在 `spring-security-crypto`（starter 传递依赖）。

---

## 5. 模块结构

新增以下文件。粗体为新增包。

### 5.1 `entity/`
- **`Admin.java`** — `admin` 表的 MP 实体。`@TableId(type=IdType.AUTO)`，`isRoot` / `status` / `lastLoginIp` / `lastLoginTime` 字段；`createdAt` / `updatedAt` 用 `MybatisPlusMetaHandler` 自动填充

### 5.2 `mapper/`
- **`AdminMapper.java`** — `extends BaseMapper<Admin>`，空接口

### 5.3 **`dto/admin/`**（新包）
- `AdminLoginRequest` — `{username, password}`，`@NotBlank`
- `AdminLoginResponse` — `{token, expiresAt, profile}`
- `AdminProfileResponse` — `{id, username, email, isRoot, status, lastLoginTime, lastLoginIp, createdAt}`
- `AdminCreateRequest` — `{username(3-50), password(8-64), email(@Valid Email)}`
- `AdminPasswordResetRequest` — `{newPassword(8-64)}`
- `AdminStatusUpdateRequest` — `{status(0|1)}`
- `AdminListItemResponse` — 列表项（不含 password）

### 5.4 **`service/admin/`**（新包）
- **`AdminTokenStore`** — Redis 双键封装：`saveToken` / `loadToken` / `touchToken` / `revokeAllTokens`
- **`AdminAuthService`** — `login / logout / getCurrentAdmin`；`BCryptPasswordEncoder.matches` 验密
- **`AdminManageService`** — `createAdmin / listAdmins / getAdmin / resetPassword / updateStatus`；所有写操作 self-protection 校验

### 5.5 **`security/admin/`**（新包）
- `AdminUserDetails` — `extends org.springframework.security.core.userdetails.User`，多带 `id` / `isRoot`
- **`AdminUserDetailsService`** — `UserDetailsService` 实现；按 `username` 查 Admin，构造 `AdminUserDetails`；`isRoot=1` → `authorities = [ROOT_ADMIN]`，否则 `[ADMIN]`
- **`AdminAuthenticationFilter`** — `OncePerRequestFilter`：解析 `Authorization: Bearer <token>`，查 Redis，命中则构造 `UsernamePasswordAuthenticationToken` 写入 `SecurityContextHolder`，并 `touchToken` 续期；未命中不设 context
- **`RestAuthenticationEntryPoint`** — 401 时写 `Result.error(ADMIN_TOKEN_INVALID)`
- **`RestAccessDeniedHandler`** — 403 时写 `Result.error(ADMIN_FORBIDDEN)`
- **`SecurityConfig`** — `SecurityFilterChain`（CSRF off / CORS 默认 / `SessionCreationPolicy.STATELESS` / 放行 `/api/health/**` 与 `/api/admin/auth/login` / 其余 `/api/admin/**` 需认证）；`PasswordEncoder` Bean（`BCryptPasswordEncoder`）；`AuthenticationManager` Bean；注册 `AdminAuthenticationFilter` 在 `UsernamePasswordAuthenticationFilter` 之前

### 5.6 **`controller/admin/`**（新包）
- **`AdminAuthController`** — `/api/admin/auth/login`（public），`/api/admin/auth/logout`（auth），`/api/admin/auth/me`（auth）
- **`AdminManageController`** — `/api/admin/manage/**`，每个方法 `@PreAuthorize("hasAuthority('ROOT_ADMIN')")`

### 5.7 **`bootstrap/`**（新包）
- **`AdminBootstrapRunner`** — `CommandLineRunner`；启动时若 `admin` 表为空，按配置种子初始管理员

### 5.8 既有文件扩展
- `common/result/ResultCode.java` — 新增 9 个枚举值（见 §7）
- `auramix_mysql_schema.sql` — 新增 `is_root` 列

---

## 6. Redis 键设计

| Key | 类型 | TTL | 用途 |
|---|---|---|---|
| `admin:token:{token}` | String(JSON) | 2h 滑动 | 前向：token → 会话信息 |
| `admin:tokens:{adminId}` | Set\<String\> | 无 | 反向：admin → 该账号全部 token（用于踢人） |

JSON schema：
```json
{
  "id": 1,
  "username": "admin",
  "isRoot": 1,
  "loginIp": "1.2.3.4",
  "loginTime": "2026-06-18T10:00:00"
}
```

反向集合里可能有"已过期但未清理"的 token 字符串。`revokeAllTokens` 时 `SMEMBERS` 然后逐个 `DEL`：已过期的 `DEL` 是 no-op，无副作用。

---

## 7. 错误码

`common/result/ResultCode.java` 新增：

| 枚举 | code | message |
|---|---|---|
| `ADMIN_BAD_CREDENTIALS` | 4011 | 用户名或密码错误 |
| `ADMIN_DISABLED` | 4031 | 账号已被停用 |
| `ADMIN_NOT_FOUND` | 4041 | 管理员不存在 |
| `ADMIN_USERNAME_TAKEN` | 4001 | 用户名已被占用 |
| `ADMIN_EMAIL_TAKEN` | 4002 | 邮箱已被占用 |
| `ADMIN_CANNOT_MODIFY_SELF` | 4003 | 不能对自己进行此操作 |
| `ADMIN_CANNOT_MODIFY_ROOT` | 4004 | 不能操作初始管理员 |
| `ADMIN_TOKEN_INVALID` | 4012 | 登录凭证无效或已过期 |
| `ADMIN_FORBIDDEN` | 4032 | 无管理员操作权限 |
| `ADMIN_ENABLE_NOT_SUPPORTED` | 4005 | 当前不支持启用账号 |

`username` 不存在与密码错误均返回 `ADMIN_BAD_CREDENTIALS`（同一提示），避免用户名枚举。

---

## 8. 数据流

### 8.1 登录

```
POST /api/admin/auth/login  {username, password}
  → AdminAuthController.login
  → AdminAuthService.login(username, password, clientIp)
    1. AdminMapper.selectOne(where username=?)
       - 不存在 → throw BusinessException(ADMIN_BAD_CREDENTIALS, 401)
    2. status == 0 → throw BusinessException(ADMIN_DISABLED, 403)
    3. BCryptPasswordEncoder.matches(raw, hash) == false
       → throw BusinessException(ADMIN_BAD_CREDENTIALS, 401)
    4. token = UUID.randomUUID().toString().replace("-", "")
    5. AdminTokenStore.saveToken(token, adminId, ip)
       - SET admin:token:{token} = JSON  EX 7200
       - SADD admin:tokens:{adminId} {token}
    6. UPDATE admin SET last_login_ip=?, last_login_time=NOW() WHERE id=?
       (失败不回滚 token——登录仍算成功)
  → AdminLoginResponse{token, expiresAt, profile}
```

### 8.2 鉴权（每次请求）

```
HTTP 请求
  → AdminAuthenticationFilter.doFilterInternal
    1. 取 Authorization header，去掉 "Bearer " 前缀
    2. token 空 → 放行，后续被 Spring Security 拒（未认证）
    3. AdminTokenStore.loadToken(token) 命中：
       - 反序列化为 AdminSessionInfo
       - touchToken: EXPIRE admin:token:{token} 7200
       - 构造 UsernamePasswordAuthenticationToken(principal, token, authorities)
         其中 principal = AdminUserDetails(id, username, password="", isRoot, authorities)
         token 作为 credentials（登出时 §8.3 需读取）
         authorities = isRoot ? [ROOT_ADMIN] : [ADMIN]
       - SecurityContextHolder.getContext().setAuthentication(auth)
    4. token 不命中 → 不设 context
    5. chain.doFilter 后 finally 清空 SecurityContextHolder
  → Spring Security AuthorizationFilter
    - /api/admin/auth/login   → 放行
    - /api/admin/auth/logout, /me  → 需认证
    - /api/admin/manage/**    → 需认证 + @PreAuthorize ROOT_ADMIN
    - /api/health/**          → 放行
  → Controller
```

### 8.3 登出

```
POST /api/admin/auth/logout
  → 鉴权过滤器已把 token 解析进 context
    (credentials 字段保存 token 字符串)
  → AdminAuthService.logout()
    1. 从 context 取 token
    2. DEL admin:token:{token}
    3. SREM admin:tokens:{adminId} {token}
  → Result.success
```

### 8.4 创建普通管理员

```
POST /api/admin/manage/admins   (@PreAuthorize ROOT_ADMIN)
  → AdminManageService.create(AdminCreateRequest req)
    1. selectCount(username=?) == 0 ?  否则 ADMIN_USERNAME_TAKEN
    2. selectCount(email=?) == 0 ?     否则 ADMIN_EMAIL_TAKEN
    3. BCrypt hash password
    4. INSERT admin(is_root=0, status=1, ...)
  → AdminProfileResponse
```

### 8.5 重置密码

```
PUT /api/admin/manage/admins/{id}/password  {newPassword}
  → AdminManageService.resetPassword(id, newPassword, currentAdminId)
    1. loadAdminById(id) → 否则 ADMIN_NOT_FOUND
    2. id == currentAdminId → ADMIN_CANNOT_MODIFY_SELF
    3. target.isRoot == 1   → ADMIN_CANNOT_MODIFY_ROOT
    4. BCrypt hash newPassword
    5. UPDATE admin SET password=? WHERE id=?
    6. AdminTokenStore.revokeAllTokens(targetId)
       - SMEMBERS admin:tokens:{targetId}
       - DEL 每个 token
       - DEL admin:tokens:{targetId}
  → Result.success
```

> **重置密码也踢人**：旧密码作废 = 旧 token 必失效。已和"重置时调用方直接传新密码"决策一致。

### 8.6 停用

```
PUT /api/admin/manage/admins/{id}/status  {status:0}
  → AdminManageService.updateStatus(id, newStatus, currentAdminId)
    1. loadAdminById → 否则 ADMIN_NOT_FOUND
    2. id == currentAdminId → ADMIN_CANNOT_MODIFY_SELF
    3. target.isRoot == 1   → ADMIN_CANNOT_MODIFY_ROOT
    4. newStatus != 0   → throw BusinessException(ADMIN_ENABLE_NOT_SUPPORTED)
       （本设计仅支持停用；启用后续单独接口）
    5. UPDATE admin SET status=? WHERE id=?
    6. AdminTokenStore.revokeAllTokens(targetId)
  → Result.success
```

> 暂不实现"启用"（`status=0` → `1`）。如需启用，后续单独接口。

### 8.7 启动种子

```
CommandLineRunner.run()
  1. AdminMapper.selectCount(*) == 0
     - 是 → 读 auramix.admin.bootstrap.{username, password}
       - username 缺省 "admin"
       - password 缺省 → 随机 12 位（大小写+数字），log.warn 打印一次
       - BCrypt hash
       - INSERT admin(is_root=1, status=1, ...)
     - 否 → 跳过
```

---

## 9. 配置

`application.yaml` 新增：

```yaml
# ============================ Admin ============================
admin:
  bootstrap:
    username: admin
    # 留空表示启动时随机生成 12 位密码并在启动日志中打印一次
    # 生产环境通过环境变量 AURAMIX_ADMIN_BOOTSTRAP_PASSWORD 注入
    password: ${AURAMIX_ADMIN_BOOTSTRAP_PASSWORD:}
  token:
    ttl-seconds: 7200          # 2h 滑动
```

---

## 10. 测试策略

### 10.1 单元测试（`src/test/java/.../service/admin/`，Mockito + JUnit 5）

| 测试类 | 覆盖场景 |
|---|---|
| `AdminAuthServiceTest` | 登录成功 / 用户不存在 / 密码错 / status=0 |
| `AdminManageServiceTest` | 创建：username 重复 / email 重复 / 成功；重置：自我保护 / 改 root / 成功且踢人；停用：自我保护 / 改 root / 成功且踢人 |
| `AdminTokenStoreTest` | save / load / touch / revokeAllTokens（mock `RedisTemplate`） |
| `AdminBootstrapRunnerTest` | 表为空 → 创建；表非空 → 跳过；password 缺省 → 生成随机并 log |

### 10.2 切片测试

| 测试类 | 范围 |
|---|---|
| `AdminAuthControllerWebTest` | `@WebMvcTest` + `@MockBean AdminAuthService`；200 / 400 / 401 路径 |
| `AdminManageControllerWebTest` | `@WebMvcTest` + `@WithMockUser(authorities="ROOT_ADMIN")`；非 root → 403 |
| `AdminAuthenticationFilterTest` | 缺 header / 错误 token / 有效 token |

### 10.3 集成测试（`@SpringBootTest` + Testcontainers MySQL + 本地/embedded Redis）

| 测试类 | 范围 |
|---|---|
| `AdminAuthIntegrationTest` | bootstrap → login → me → logout → 再 me 401 |
| `AdminManageIntegrationTest` | root 登录 → 创建 → 新账号登录 → root 重置其密码（验证旧 token 失效）→ root 停用（验证踢人） |
| `AdminSelfProtectionIntegrationTest` | root 重置自己 / 停用自己 → 400；root 停用 root → 400；普通 admin 调 create → 403 |

### 10.4 覆盖率目标

`AdminAuthService` / `AdminManageService` / `AdminTokenStore` / `AdminBootstrapRunner` 行覆盖 ≥ 90%。

---

## 11. 不在本期范围（YAGNI）

- 多租户 / 多角色（super / op / readonly）
- 管理员操作审计日志表（`admin_audit_log`）—— 暂时只用 slf4j 打日志
- 登录失败限流 / 账号锁定
- 启用被停用账号的接口
- 修改自身密码的接口
- 管理员列表的搜索 / 过滤
- HTTPS / CORS 严格化
- 单元测试覆盖率强制门槛（CI 上执行）

---

## 12. 实施里程碑（高层）

1. **基础层**：DDL 改动、pom 依赖、Admin 实体、AdminMapper、AdminTokenStore
2. **安全层**：SecurityConfig、AdminUserDetails(Service)、AdminAuthenticationFilter、两个 ExceptionHandler
3. **业务层**：AdminAuthService、AdminManageService、ResultCode 扩展
4. **接口层**：AdminAuthController、AdminManageController
5. **启动层**：AdminBootstrapRunner + application.yaml
6. **测试**：单元 → 切片 → 集成

每个里程碑独立可编译、可手动验证。
