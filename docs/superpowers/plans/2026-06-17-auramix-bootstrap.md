# Auramix 项目基础架构实施计划

**Goal:** 基于 `项目初始数据设计.md` 中的 17 张 MySQL 表，搭建 Spring Boot 4.1 + MyBatis-Plus + Redis 的项目基础架构，并实现全局统一响应与全局异常处理。

**Architecture:**
- 分层：`controller` / `service` / `mapper` / `entity` / `config` / `common`（含 result、exception）
- 持久层：MyBatis-Plus 3.5.x，主键雪花 ID 自动生成，MetaObjectHandler 自动填充 `created_at`/`updated_at`
- 缓存：Spring Data Redis (Lettuce) + Jackson 序列化
- 统一响应：`Result<T>` 包装所有 controller 返回；`@RestControllerAdvice` 兜底业务异常与系统异常

**Tech Stack:** Spring Boot 4.1.0、Java 21、MyBatis-Plus 3.5.9、MySQL 8、Hutool 5.8.x、Spring Data Redis

---

## 文件结构

```
src/main/java/com/son/auramix/
├── AuramixApplication.java
├── common/
│   ├── result/
│   │   ├── Result.java              # 统一响应包装
│   │   ├── ResultCode.java          # 业务/系统状态码枚举
│   │   └── PageResult.java          # 分页响应包装
│   └── exception/
│       ├── BusinessException.java   # 业务异常
│       └── GlobalExceptionHandler.java  # @RestControllerAdvice
├── config/
│   ├── MybatisPlusConfig.java       # 分页插件 + 自动填充
│   ├── MybatisPlusMetaHandler.java  # created_at/updated_at 填充
│   └── RedisConfig.java             # RedisTemplate 序列化
├── controller/
│   └── HealthController.java        # 验证 Result 与异常处理
├── entity/
│   ├── User.java / Artist.java / Album.java / Track.java
│   ├── TrackArtist.java / AlbumArtist.java
│   ├── TrackAudioResource.java / TrackVideoResource.java
│   ├── Genre.java / TrackGenre.java
│   ├── Playlist.java / PlaylistTrack.java
│   ├── PlaylistFollower.java / ArtistFollower.java
│   ├── LikedTrack.java / LikedAlbum.java
│   └── PlaybackHistory.java
└── mapper/
    ├── UserMapper.java ... PlaybackHistoryMapper.java
```

---

## 任务清单

### Task 1: pom.xml 依赖 + application.yaml 配置
- pom.xml 添加：spring-boot-starter-web、spring-boot-starter-validation、spring-boot-starter-data-redis、mybatis-plus-spring-boot3-starter、commons-pool2、hutool
- application.yaml：端口、datasource、mybatis-plus、redis、logging

### Task 2: common/result 与 common/exception
- `Result<T>`：code/message/data/timestamp + success() / error() / of() 静态方法
- `ResultCode` 枚举：SUCCESS / BAD_REQUEST / VALIDATION_ERROR / BUSINESS_ERROR / NOT_FOUND / INTERNAL_ERROR
- `PageResult<T>`：records / total / current / size
- `BusinessException` + `GlobalExceptionHandler` 处理 BusinessException / MethodArgumentNotValidException / ConstraintViolationException / RuntimeException

### Task 3: config 三个配置类
- `MybatisPlusConfig`：注册 `MybatisPlusInterceptor`（PaginationInnerInterceptor），启用 `id-type: ASSIGN_ID`，`db-config` 驼峰下划线映射
- `MybatisPlusMetaHandler`：`insertFill` 写 created_at/updated_at，`updateFill` 写 updated_at
- `RedisConfig`：RedisTemplate<String,Object> 用 Jackson2JsonRedisSerializer

### Task 4: 17 张表的 Entity + Mapper
- 所有主键 `Long id` + `@TableId(type = IdType.ASSIGN_ID)`
- 关联表复合主键使用 `serialVersionUID` + `@TableField` 标注
- `created_at` / `updated_at` 标记 `fill = FieldFill.INSERT` / `FieldFill.INSERT_UPDATE`
- Mapper 继承 `BaseMapper<Entity>`

### Task 5: 验证
- `HealthController` 暴露 `/api/health` 验证 `Result` 包装
- `mvn -q -DskipTests compile` 通过
