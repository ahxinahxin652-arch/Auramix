-- ==============================================================================
-- Auramix MySQL Database Schema DDL
-- Generated: 2026-06-17
-- Design: Snowflake IDs (BIGINT), Integer States/Enums, Cloud Lyrics URLs, No Physical Foreign Keys
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- DROP TABLES IF EXISTS (In order of dependencies if keys are added later)
-- ------------------------------------------------------------------------------

create database IF NOT EXISTS auramix;
use auramix;

DROP table IF EXISTS `admin`;
DROP TABLE IF EXISTS `playback_history`;
DROP TABLE IF EXISTS `liked_albums`;
DROP TABLE IF EXISTS `liked_tracks`;
DROP TABLE IF EXISTS `artist_followers`;
DROP TABLE IF EXISTS `playlist_followers`;
DROP TABLE IF EXISTS `playlist_tracks`;
DROP TABLE IF EXISTS `playlists`;
DROP TABLE IF EXISTS `track_genres`;
DROP TABLE IF EXISTS `genres`;
DROP TABLE IF EXISTS `track_video_resources`;
DROP TABLE IF EXISTS `track_audio_resources`;
DROP TABLE IF EXISTS `album_artists`;
DROP TABLE IF EXISTS `track_artists`;
DROP TABLE IF EXISTS `tracks`;
DROP TABLE IF EXISTS `albums`;
DROP TABLE IF EXISTS `artists`;
DROP TABLE IF EXISTS `users`;
DROP TABLE IF EXISTS `user_behavior_logs`;

-- ------------------------------------------------------------------------------
-- 1. 用户表 (users)
-- ------------------------------------------------------------------------------
CREATE TABLE `users` (
  `id` BIGINT NOT NULL PRIMARY KEY COMMENT '雪花算法唯一ID',
  `email` VARCHAR(255) NOT NULL,
  `password_hash` VARCHAR(255) NOT NULL,
  `display_name` VARCHAR(100) NOT NULL,
  `avatar_url` VARCHAR(500) NULL,
  `country` CHAR(2) NOT NULL DEFAULT 'CN' COMMENT '国家代码 (ISO-3166 2位代码)',
  `product` INT NOT NULL DEFAULT 0 COMMENT '产品等级/订阅类型: 0为免费用户(free), 1为会员用户(premium)',
  `status` INT NOT NULL DEFAULT 0 COMMENT '用户状态: 0为正常(active), -1为封禁(banned)',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY `users_email_key` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 2. 歌手/艺人表 (artists)
-- ------------------------------------------------------------------------------
CREATE TABLE `artists` (
  `id` BIGINT NOT NULL PRIMARY KEY COMMENT '雪花算法唯一ID',
  `name` VARCHAR(255) NOT NULL,
  `cover_img` VARCHAR(500) NULL,
  `bio` TEXT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY `artists_name_key` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 3. 专辑表 (albums)
-- ------------------------------------------------------------------------------
CREATE TABLE `albums` (
  `id` BIGINT NOT NULL PRIMARY KEY COMMENT '雪花算法唯一ID',
  `title` VARCHAR(255) NOT NULL,
  `cover_url` VARCHAR(500) NULL,
  `release_date` DATETIME NOT NULL,
  `album_type` INT NOT NULL DEFAULT 0 COMMENT '专辑类型: 0为合辑/标准专辑(album), 1为单曲(single), 2为EP/迷你专辑(ep)',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 4. 单曲/曲目表 (tracks)
-- ------------------------------------------------------------------------------
CREATE TABLE `tracks` (
  `id` BIGINT NOT NULL PRIMARY KEY COMMENT '雪花算法唯一ID',
  `album_id` BIGINT NOT NULL COMMENT '关联专辑ID',
  `title` VARCHAR(255) NOT NULL,
  `duration` INT NOT NULL COMMENT '时长（毫秒）',
  `lyrics_url` VARCHAR(255) NULL COMMENT '云端LRC歌词文件URL',
  `status` INT NOT NULL DEFAULT 3 COMMENT '歌曲状态: 0为正常播放, 1为已下架, 2为暂无版权, 3为待审核',
  `liked_count` INT NOT NULL DEFAULT 0 COMMENT '被收藏红心总次数',
  `play_count` BIGINT NOT NULL DEFAULT 0 COMMENT '流媒体总播放/播放次数',
  `track_number` INT NOT NULL COMMENT '该曲目在专辑/碟片中的音轨顺序(从1开始)',
  `disc_number` INT NOT NULL DEFAULT 1 COMMENT '多碟CD专辑中的碟片序号(从1开始，单CD专辑默认为1)',
  `member` INT NOT NULL DEFAULT 0 COMMENT '是否会员歌曲: 0非会员, 1会员',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY `tracks_album_id_idx` (`album_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 5. 歌曲-歌手关联表 (track_artists)
-- ------------------------------------------------------------------------------
CREATE TABLE `track_artists` (
  `track_id` BIGINT NOT NULL,
  `artist_id` BIGINT NOT NULL,
  `role` INT NOT NULL DEFAULT 0 COMMENT '歌手角色/分工: 0为主要歌手(Main Artist), 1为合作歌手(Featuring), 2为词曲作者(Composer/Songwriter)',
  PRIMARY KEY (`track_id`, `artist_id`),
  KEY `track_artists_track_id_idx` (`track_id`),
  KEY `track_artists_artist_id_idx` (`artist_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 6. 专辑-歌手关联表 (album_artists)
-- ------------------------------------------------------------------------------
CREATE TABLE `album_artists` (
  `album_id` BIGINT NOT NULL,
  `artist_id` BIGINT NOT NULL,
  PRIMARY KEY (`album_id`, `artist_id`),
  KEY `album_artists_album_id_idx` (`album_id`),
  KEY `album_artists_artist_id_idx` (`artist_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 7. 音源资源表 (track_audio_resources)
-- ------------------------------------------------------------------------------
CREATE TABLE `track_audio_resources` (
  `id` BIGINT NOT NULL PRIMARY KEY COMMENT '雪花算法唯一ID',
  `track_id` BIGINT NOT NULL COMMENT '关联单曲ID',
  `quality` INT NOT NULL DEFAULT 1 COMMENT '音质级别: 0为普通(low, 128kbps), 1为高品质(medium/high, 320kbps), 2为无损(lossless, FLAC等)',
  `format` INT NOT NULL DEFAULT 0 COMMENT '音频封装格式: 0为mp3, 1为flac, 2为m4a, 3为ogg',
  `bitrate` INT NOT NULL COMMENT '码率 (如 320000, 1411200)',
  `stream_url` VARCHAR(1000) NOT NULL COMMENT '音频播放或下载地址',
  `size` BIGINT NOT NULL COMMENT '文件大小 (字节)',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY `track_audio_resources_track_id_idx` (`track_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 8. MV 视频资源表 (track_video_resources)
-- ------------------------------------------------------------------------------
CREATE TABLE `track_video_resources` (
  `id` BIGINT NOT NULL PRIMARY KEY COMMENT '雪花算法唯一ID',
  `track_id` BIGINT NOT NULL COMMENT '关联单曲ID',
  `quality` INT NOT NULL DEFAULT 1 COMMENT '清晰度/画质: 0为标清(360p), 1为高清(720p), 2为超清(1080p), 3为4K极清(4k)',
  `resolution` VARCHAR(20) NOT NULL COMMENT '物理分辨率 (如 1920x1080)',
  `fps` INT NOT NULL DEFAULT 30 COMMENT '帧率 (如 30, 60)',
  `format` INT NOT NULL DEFAULT 0 COMMENT '视频封装格式: 0为mp4, 1为webm, 2为mkv',
  `bitrate` INT NOT NULL COMMENT '视频码率 (如 2500000, 8000000)',
  `stream_url` VARCHAR(1000) NOT NULL COMMENT 'MV视频流媒体播放地址',
  `size` BIGINT NOT NULL COMMENT '文件大小 (字节)',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY `track_video_resources_track_id_idx` (`track_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 9. 流派表 (genres)
-- ------------------------------------------------------------------------------
CREATE TABLE `genres` (
  `id` BIGINT NOT NULL PRIMARY KEY COMMENT '雪花算法唯一ID',
  `name` VARCHAR(100) NOT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY `genres_name_key` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 10. 歌曲-流派关联表 (track_genres)
-- ------------------------------------------------------------------------------
CREATE TABLE `track_genres` (
  `track_id` BIGINT NOT NULL,
  `genre_id` BIGINT NOT NULL,
  PRIMARY KEY (`track_id`, `genre_id`),
  KEY `track_genres_track_id_idx` (`track_id`),
  KEY `track_genres_genre_id_idx` (`genre_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 11. 歌单表 (playlists)
-- ------------------------------------------------------------------------------
CREATE TABLE `playlists` (
  `id` BIGINT NOT NULL PRIMARY KEY COMMENT '雪花算法唯一ID',
  `owner_id` BIGINT NOT NULL COMMENT '歌单创建者ID',
  `name` VARCHAR(255) NOT NULL,
  `description` VARCHAR(1000) NULL,
  `cover_url` VARCHAR(500) NULL,
  `is_public` TINYINT(1) NOT NULL DEFAULT 1 COMMENT '是否公开: 0为私密, 1为公开',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY `playlists_owner_id_idx` (`owner_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 12. 歌单-歌曲关联表 (playlist_tracks)
-- ------------------------------------------------------------------------------
CREATE TABLE `playlist_tracks` (
  `playlist_id` BIGINT NOT NULL,
  `track_id` BIGINT NOT NULL,
  `sort_order` INT NOT NULL DEFAULT 0 COMMENT '排序顺序',
  `added_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`playlist_id`, `track_id`),
  KEY `playlist_tracks_playlist_id_idx` (`playlist_id`),
  KEY `playlist_tracks_track_id_idx` (`track_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 13. 歌单关注表 (playlist_followers)
-- ------------------------------------------------------------------------------
CREATE TABLE `playlist_followers` (
  `playlist_id` BIGINT NOT NULL,
  `user_id` BIGINT NOT NULL,
  `followed_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`playlist_id`, `user_id`),
  KEY `playlist_followers_playlist_id_idx` (`playlist_id`),
  KEY `playlist_followers_user_id_idx` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 14. 歌手关注表 (artist_followers)
-- ------------------------------------------------------------------------------
CREATE TABLE `artist_followers` (
  `artist_id` BIGINT NOT NULL COMMENT '歌手ID',
  `user_id` BIGINT NOT NULL COMMENT '用户ID',
  `followed_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`artist_id`, `user_id`),
  KEY `artist_followers_artist_id_idx` (`artist_id`),
  KEY `artist_followers_user_id_idx` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ------------------------------------------------------------------------------
-- 15. 单曲收藏表 (liked_tracks)
-- ------------------------------------------------------------------------------
CREATE TABLE `liked_tracks` (
  `user_id` BIGINT NOT NULL,
  `track_id` BIGINT NOT NULL,
  `liked_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_id`, `track_id`),
  KEY `liked_tracks_user_id_idx` (`user_id`),
  KEY `liked_tracks_track_id_idx` (`track_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 16. 专辑收藏表 (liked_albums)
-- ------------------------------------------------------------------------------
CREATE TABLE `liked_albums` (
  `album_id` BIGINT NOT NULL COMMENT '专辑ID',
  `user_id` BIGINT NOT NULL COMMENT '用户ID',
  `liked_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`album_id`, `user_id`),
  KEY `liked_albums_album_id_idx` (`album_id`),
  KEY `liked_albums_user_id_idx` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ------------------------------------------------------------------------------
-- 17. 播放历史记录表 (playback_history)
-- ------------------------------------------------------------------------------
CREATE TABLE `playback_history` (
  `id` BIGINT NOT NULL PRIMARY KEY COMMENT '雪花算法唯一ID',
  `user_id` BIGINT NOT NULL,
  `track_id` BIGINT NOT NULL,
  `played_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `context_type` INT NULL COMMENT '播放来源类型: 0为歌单(playlist), 1为专辑(album), 2为歌手页(artist)',
  `context_id` BIGINT NULL COMMENT '对应的来源ID',
  KEY `playback_history_user_id_idx` (`user_id`),
  KEY `playback_history_track_id_idx` (`track_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 18. 管理员表 (admin)
-- ------------------------------------------------------------------------------
CREATE TABLE `admin` (
                         `id` INT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '管理员ID（主键）',
                         `username` VARCHAR(50) NOT NULL COMMENT '登录用户名',
                         `password` VARCHAR(255) NOT NULL COMMENT '加密密码（使用bcrypt/argon2）',
                         `email` VARCHAR(100) DEFAULT NULL COMMENT '邮箱',
                         `is_root` TINYINT(1) NOT NULL DEFAULT 0
                           COMMENT '是否初始管理员: 0否 1是',
                         `status` TINYINT(1) NOT NULL DEFAULT 1 COMMENT '状态：0禁用 1启用',
                         `last_login_ip` VARCHAR(45) DEFAULT NULL COMMENT '最后登录IP（支持IPv6）',
                         `last_login_time` DATETIME DEFAULT NULL COMMENT '最后登录时间',
                         `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
                         `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
                         PRIMARY KEY (`id`),
                         UNIQUE KEY `uk_username` (`username`),
                         UNIQUE KEY `uk_email` (`email`),
                         KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='管理员表';

-- ------------------------------------------------------------------------------
-- 19. 歌曲AI审核记录表 (track_review_records)
-- ------------------------------------------------------------------------------
CREATE TABLE `track_review_records` (
  `id`              BIGINT       NOT NULL PRIMARY KEY COMMENT '雪花算法唯一ID',
  `track_id`        BIGINT       NOT NULL COMMENT '关联单曲ID',
  `track_title`     VARCHAR(255) NOT NULL COMMENT '审核时的歌曲标题快照',
  `artist_names`    VARCHAR(1000) NULL   COMMENT '审核时的歌手名快照(逗号分隔)',
  `album_title`     VARCHAR(255) NULL   COMMENT '审核时的专辑标题快照',
  `lyrics_content`  TEXT         NULL   COMMENT '拉取的LRC歌词文本快照',
  `verdict`         INT          NOT NULL DEFAULT 0 COMMENT '裁决: 0=待审核, 1=通过, -1=不通过, -2=待人工确认',
  `confidence`      INT          NOT NULL DEFAULT 0 COMMENT '最终置信度 0-100',
  `fail_reasons`    TEXT         NULL   COMMENT '不通过原因(各fail agent拼接)',
  `agent_results`   TEXT         NULL   COMMENT '4+1个agent的完整JSON输出',
  `status`          INT          NOT NULL DEFAULT 0 COMMENT '处理状态: 0=AI审核中, 1=AI审核完成待自动处理, 2=已自动处理, 3=待人工确认, 4=人工已确认, 5=失败/异常',
  `admin_id`        BIGINT       NULL   COMMENT '人工确认的管理员ID',
  `admin_verdict`   INT          NULL   COMMENT '管理员裁决: 1=通过, -1=不通过',
  `admin_note`      VARCHAR(500) NULL   COMMENT '管理员备注',
  `reviewed_at`     DATETIME     NULL   COMMENT '管理员确认时间',
  `created_at`      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY `track_review_records_track_id_idx` (`track_id`),
  KEY `track_review_records_status_idx` (`status`),
  KEY `track_review_records_verdict_idx` (`verdict`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='歌曲AI审核记录表';

-- ------------------------------------------------------------------------------
-- 用户行为日志表
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `user_behavior_logs` (
  `id`           BIGINT       NOT NULL COMMENT 'Snowflake主键',
  `user_id`      BIGINT       NOT NULL COMMENT '用户ID',
  `action_type`  VARCHAR(32)  NOT NULL COMMENT '操作类型：play/like/share/download/follow',
  `target_type`  TINYINT      NOT NULL COMMENT '目标类型：0=歌曲 1=专辑 2=歌手 3=歌单',
  `target_id`    BIGINT       NOT NULL COMMENT '目标ID',
  `metadata`     TEXT         NULL     COMMENT '附加信息JSON',
  `created_at`   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_user_behavior_user_id` (`user_id`),
  KEY `idx_user_behavior_action_type` (`action_type`),
  KEY `idx_user_behavior_target` (`target_type`, `target_id`),
  KEY `idx_user_behavior_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户行为日志表';
