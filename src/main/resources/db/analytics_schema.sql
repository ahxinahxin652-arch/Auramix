-- =====================================================================
-- Auramix 新功能模块数据库 Schema
-- 模块: 数据分析与可视化 + 用户周期个性化总结(AI)
-- 注意: 本文件与 auramix_mysql_schema.sql / auramix.sql 互相独立,
--       由开发者自行选择时机手动执行(无需修改原文件).
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. 用户周期总结报告主表
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS user_periodic_reports (
    id              BIGINT          NOT NULL                COMMENT '雪花 ID',
    user_id         BIGINT          NOT NULL                COMMENT '用户 ID',
    period_type     TINYINT         NOT NULL                COMMENT '1=周报 2=月报',
    period_start    DATE            NOT NULL                COMMENT '周期起始日(周报=周一,月报=1号)',
    period_end      DATE            NOT NULL                COMMENT '周期结束日(周报=周日,月报=月末)',
    stats_snapshot  JSON            NOT NULL                COMMENT '统计快照 JSON(冗余,避免统计层变更影响历史报告)',
    llm_summary     TEXT            NULL                    COMMENT 'LLM 生成的总结文本',
    mood_tags       VARCHAR(255)    NULL                    COMMENT '心情标签, 逗号分隔',
    highlights      JSON            NULL                    COMMENT '重点时刻 JSON',
    recommendations JSON            NULL                    COMMENT '推荐收听 JSON',
    status          TINYINT         NOT NULL DEFAULT 0      COMMENT '0=生成中 1=已生成 2=失败 3=无数据',
    error_message   VARCHAR(500)    NULL                    COMMENT '失败原因',
    generated_at    DATETIME        NULL                    COMMENT 'LLM 生成完成时间',
    created_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uk_user_period (user_id, period_type, period_start),
    KEY idx_user (user_id),
    KEY idx_period (period_type, period_start)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户周期总结报告';

-- ---------------------------------------------------------------------
-- 2. 用户周期听歌统计缓存表
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS user_listening_stats (
    id                  BIGINT          NOT NULL            COMMENT '雪花 ID',
    user_id             BIGINT          NOT NULL            COMMENT '用户 ID',
    period_type         TINYINT         NOT NULL            COMMENT '1=周报 2=月报',
    period_start        DATE            NOT NULL            COMMENT '周期起始日',
    period_end          DATE            NOT NULL            COMMENT '周期结束日',
    total_plays         INT             NOT NULL DEFAULT 0  COMMENT '总播放次数',
    total_duration_sec  BIGINT          NOT NULL DEFAULT 0  COMMENT '总听歌时长(秒)',
    unique_tracks       INT             NOT NULL DEFAULT 0  COMMENT '去重歌曲数',
    top_tracks          JSON            NULL                COMMENT 'TOP 歌曲 JSON 数组',
    top_artists         JSON            NULL                COMMENT 'TOP 歌手 JSON 数组',
    top_genres          JSON            NULL                COMMENT 'TOP 流派 JSON 数组',
    top_albums          JSON            NULL                COMMENT 'TOP 专辑 JSON 数组',
    hourly_distribution JSON            NULL                COMMENT '24 长度数组, 每小时播放量',
    weekday_distribution JSON           NULL                COMMENT '7 长度数组, 每周各天播放量',
    peak_day            DATE            NULL                COMMENT '听歌峰值日期',
    liked_count         INT             NOT NULL DEFAULT 0  COMMENT '周期内新增红心数',
    report_id           BIGINT          NULL                COMMENT '关联的报告 ID',
    created_at          DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uk_stats (user_id, period_type, period_start),
    KEY idx_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户周期听歌统计缓存';

-- ---------------------------------------------------------------------
-- 3. 报告用户反馈表
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS report_feedback (
    id          BIGINT          NOT NULL                COMMENT '雪花 ID',
    report_id   BIGINT          NOT NULL                COMMENT '报告 ID',
    user_id     BIGINT          NOT NULL                COMMENT '用户 ID',
    rating      TINYINT         NULL                    COMMENT '1=赞 2=踩',
    comment     VARCHAR(500)    NULL                    COMMENT '文字反馈',
    created_at  DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_report (report_id),
    KEY idx_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='报告用户反馈';