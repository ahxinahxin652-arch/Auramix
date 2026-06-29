/*
 Navicat Premium Dump SQL

 Source Server         : Auramix
 Source Server Type    : MySQL
 Source Server Version : 80046 (8.0.46)
 Source Host           : 60.205.218.199:3306
 Source Schema         : auramix

 Target Server Type    : MySQL
 Target Server Version : 80046 (8.0.46)
 File Encoding         : 65001

 Date: 29/06/2026 11:56:05
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for admin
-- ----------------------------
DROP TABLE IF EXISTS `admin`;
CREATE TABLE `admin`  (
  `id` int UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '管理员ID（主键）',
  `username` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '登录用户名',
  `password` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '加密密码（使用bcrypt/argon2）',
  `email` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '邮箱',
  `is_root` tinyint(1) NOT NULL DEFAULT 0 COMMENT '是否初始管理员: 0否 1是',
  `status` tinyint(1) NOT NULL DEFAULT 1 COMMENT '状态：0禁用 1启用',
  `last_login_ip` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '最后登录IP（支持IPv6）',
  `last_login_time` datetime NULL DEFAULT NULL COMMENT '最后登录时间',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uk_username`(`username` ASC) USING BTREE,
  UNIQUE INDEX `uk_email`(`email` ASC) USING BTREE,
  INDEX `idx_status`(`status` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 2 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '管理员表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for album_artists
-- ----------------------------
DROP TABLE IF EXISTS `album_artists`;
CREATE TABLE `album_artists`  (
  `album_id` bigint NOT NULL,
  `artist_id` bigint NOT NULL,
  PRIMARY KEY (`album_id`, `artist_id`) USING BTREE,
  INDEX `album_artists_album_id_idx`(`album_id` ASC) USING BTREE,
  INDEX `album_artists_artist_id_idx`(`artist_id` ASC) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for albums
-- ----------------------------
DROP TABLE IF EXISTS `albums`;
CREATE TABLE `albums`  (
  `id` bigint NOT NULL COMMENT '雪花算法唯一ID',
  `title` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `cover_url` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `release_date` datetime NOT NULL,
  `album_type` int NOT NULL DEFAULT 0 COMMENT '专辑类型: 0为合辑/标准专辑(album), 1为单曲(single), 2为EP/迷你专辑(ep)',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for artist_followers
-- ----------------------------
DROP TABLE IF EXISTS `artist_followers`;
CREATE TABLE `artist_followers`  (
  `artist_id` bigint NOT NULL COMMENT '歌手ID',
  `user_id` bigint NOT NULL COMMENT '用户ID',
  `followed_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`artist_id`, `user_id`) USING BTREE,
  INDEX `artist_followers_artist_id_idx`(`artist_id` ASC) USING BTREE,
  INDEX `artist_followers_user_id_idx`(`user_id` ASC) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for artists
-- ----------------------------
DROP TABLE IF EXISTS `artists`;
CREATE TABLE `artists`  (
  `id` bigint NOT NULL COMMENT '雪花算法唯一ID',
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `cover_img` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `bio` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `artists_name_key`(`name` ASC) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for genres
-- ----------------------------
DROP TABLE IF EXISTS `genres`;
CREATE TABLE `genres`  (
  `id` bigint NOT NULL COMMENT '雪花算法唯一ID',
  `name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `genres_name_key`(`name` ASC) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for liked_albums
-- ----------------------------
DROP TABLE IF EXISTS `liked_albums`;
CREATE TABLE `liked_albums`  (
  `album_id` bigint NOT NULL COMMENT '专辑ID',
  `user_id` bigint NOT NULL COMMENT '用户ID',
  `liked_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`album_id`, `user_id`) USING BTREE,
  INDEX `liked_albums_album_id_idx`(`album_id` ASC) USING BTREE,
  INDEX `liked_albums_user_id_idx`(`user_id` ASC) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for liked_tracks
-- ----------------------------
DROP TABLE IF EXISTS `liked_tracks`;
CREATE TABLE `liked_tracks`  (
  `user_id` bigint NOT NULL,
  `track_id` bigint NOT NULL,
  `liked_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_id`, `track_id`) USING BTREE,
  INDEX `liked_tracks_user_id_idx`(`user_id` ASC) USING BTREE,
  INDEX `liked_tracks_track_id_idx`(`track_id` ASC) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for member_benefits
-- ----------------------------
DROP TABLE IF EXISTS `member_benefits`;
CREATE TABLE `member_benefits`  (
  `id` bigint NOT NULL COMMENT '雪花算法唯一ID',
  `plan_id` bigint NOT NULL COMMENT '会员方案ID',
  `benefit_key` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '权益键（如: lossless_audio, download, hifi)',
  `benefit_value` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '权益值/描述',
  `benefit_type` int NOT NULL DEFAULT 0 COMMENT '权益类型: 0=布尔(是否拥有), 1=数值(次数/容量), 2=文本描述',
  `status` int NOT NULL DEFAULT 1 COMMENT '状态: 0=禁用, 1=启用',
  `sort_order` int NOT NULL DEFAULT 0 COMMENT '展示顺序',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `member_benefits_plan_id_idx`(`plan_id` ASC) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for membership_plans
-- ----------------------------
DROP TABLE IF EXISTS `membership_plans`;
CREATE TABLE `membership_plans`  (
  `id` bigint NOT NULL COMMENT '雪花算法唯一ID',
  `name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '方案名称（如：月卡会员、季卡会员、年卡会员）',
  `description` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '方案描述',
  `duration_months` int NOT NULL COMMENT '会员时长（月）',
  `price` decimal(10, 2) NOT NULL COMMENT '售价（元）',
  `original_price` decimal(10, 2) NULL DEFAULT NULL COMMENT '原价（划线价）',
  `level` int NOT NULL DEFAULT 0 COMMENT '会员等级: 0=标准会员',
  `status` int NOT NULL DEFAULT 1 COMMENT '状态: 0=下架, 1=上架',
  `sort_order` int NOT NULL DEFAULT 0 COMMENT '排序顺序（升序）',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `name`(`name` ASC) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for payment_orders
-- ----------------------------
DROP TABLE IF EXISTS `payment_orders`;
CREATE TABLE `payment_orders`  (
  `id` bigint NOT NULL COMMENT '雪花算法唯一ID',
  `order_no` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '业务订单号（唯一）',
  `user_id` bigint NOT NULL COMMENT '用户ID',
  `plan_id` bigint NOT NULL COMMENT '购买的会员方案ID',
  `amount` decimal(10, 2) NOT NULL COMMENT '支付金额（元）',
  `currency` char(3) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'CNY' COMMENT '货币代码',
  `pay_type` int NOT NULL DEFAULT 0 COMMENT '支付方式: 0=微信支付, 1=支付宝',
  `status` int NOT NULL DEFAULT 0 COMMENT '订单状态: 0=待支付, 1=已支付, 2=已取消, 3=已退款',
  `pay_url` varchar(1000) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '支付二维码/链接',
  `pay_time` datetime NULL DEFAULT NULL COMMENT '实际支付时间',
  `expire_time` datetime NOT NULL COMMENT '订单过期时间',
  `transaction_id` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '支付平台交易流水号',
  `refund_time` datetime NULL DEFAULT NULL COMMENT '退款时间',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `payment_orders_order_no_key`(`order_no` ASC) USING BTREE,
  INDEX `payment_orders_user_id_idx`(`user_id` ASC) USING BTREE,
  INDEX `payment_orders_plan_id_idx`(`plan_id` ASC) USING BTREE,
  INDEX `payment_orders_status_idx`(`status` ASC) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for playback_history
-- ----------------------------
DROP TABLE IF EXISTS `playback_history`;
CREATE TABLE `playback_history`  (
  `id` bigint NOT NULL COMMENT '雪花算法唯一ID',
  `user_id` bigint NOT NULL,
  `track_id` bigint NOT NULL,
  `played_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `context_type` int NULL DEFAULT NULL COMMENT '播放来源类型: 0为歌单(playlist), 1为专辑(album), 2为歌手页(artist)',
  `context_id` bigint NULL DEFAULT NULL COMMENT '对应的来源ID',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `playback_history_user_id_idx`(`user_id` ASC) USING BTREE,
  INDEX `playback_history_track_id_idx`(`track_id` ASC) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for playlist_followers
-- ----------------------------
DROP TABLE IF EXISTS `playlist_followers`;
CREATE TABLE `playlist_followers`  (
  `playlist_id` bigint NOT NULL,
  `user_id` bigint NOT NULL,
  `followed_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`playlist_id`, `user_id`) USING BTREE,
  INDEX `playlist_followers_playlist_id_idx`(`playlist_id` ASC) USING BTREE,
  INDEX `playlist_followers_user_id_idx`(`user_id` ASC) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for playlist_tracks
-- ----------------------------
DROP TABLE IF EXISTS `playlist_tracks`;
CREATE TABLE `playlist_tracks`  (
  `playlist_id` bigint NOT NULL,
  `track_id` bigint NOT NULL,
  `sort_order` int NOT NULL DEFAULT 0 COMMENT '排序顺序',
  `added_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`playlist_id`, `track_id`) USING BTREE,
  INDEX `playlist_tracks_playlist_id_idx`(`playlist_id` ASC) USING BTREE,
  INDEX `playlist_tracks_track_id_idx`(`track_id` ASC) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for playlists
-- ----------------------------
DROP TABLE IF EXISTS `playlists`;
CREATE TABLE `playlists`  (
  `id` bigint NOT NULL COMMENT '雪花算法唯一ID',
  `owner_id` bigint NOT NULL COMMENT '歌单创建者ID',
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(1000) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `cover_url` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `is_public` tinyint(1) NOT NULL DEFAULT 1 COMMENT '是否公开: 0为私密, 1为公开',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `playlists_owner_id_idx`(`owner_id` ASC) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for track_artists
-- ----------------------------
DROP TABLE IF EXISTS `track_artists`;
CREATE TABLE `track_artists`  (
  `track_id` bigint NOT NULL,
  `artist_id` bigint NOT NULL,
  `role` int NOT NULL DEFAULT 0 COMMENT '歌手角色/分工: 0为主要歌手(Main Artist), 1为合作歌手(Featuring), 2为词曲作者(Composer/Songwriter)',
  PRIMARY KEY (`track_id`, `artist_id`) USING BTREE,
  INDEX `track_artists_track_id_idx`(`track_id` ASC) USING BTREE,
  INDEX `track_artists_artist_id_idx`(`artist_id` ASC) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for track_audio_resources
-- ----------------------------
DROP TABLE IF EXISTS `track_audio_resources`;
CREATE TABLE `track_audio_resources`  (
  `id` bigint NOT NULL COMMENT '雪花算法唯一ID',
  `track_id` bigint NOT NULL COMMENT '关联单曲ID',
  `quality` int NOT NULL DEFAULT 1 COMMENT '音质级别: 0为普通(low, 128kbps), 1为高品质(medium/high, 320kbps), 2为无损(lossless, FLAC等)',
  `format` int NOT NULL DEFAULT 0 COMMENT '音频封装格式: 0为mp3, 1为flac, 2为m4a, 3为ogg',
  `bitrate` int NOT NULL COMMENT '码率 (如 320000, 1411200)',
  `stream_url` varchar(1000) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '音频播放或下载地址',
  `size` bigint NOT NULL COMMENT '文件大小 (字节)',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `track_audio_resources_track_id_idx`(`track_id` ASC) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for track_genres
-- ----------------------------
DROP TABLE IF EXISTS `track_genres`;
CREATE TABLE `track_genres`  (
  `track_id` bigint NOT NULL,
  `genre_id` bigint NOT NULL,
  PRIMARY KEY (`track_id`, `genre_id`) USING BTREE,
  INDEX `track_genres_track_id_idx`(`track_id` ASC) USING BTREE,
  INDEX `track_genres_genre_id_idx`(`genre_id` ASC) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for track_review_records
-- ----------------------------
DROP TABLE IF EXISTS `track_review_records`;
CREATE TABLE `track_review_records`  (
  `id` bigint NOT NULL COMMENT '雪花算法唯一ID',
  `track_id` bigint NOT NULL COMMENT '关联单曲ID',
  `track_title` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '审核时的歌曲标题快照',
  `artist_names` varchar(1000) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '审核时的歌手名快照(逗号分隔)',
  `album_title` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '审核时的专辑标题快照',
  `lyrics_content` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT '拉取的LRC歌词文本快照',
  `verdict` int NOT NULL DEFAULT 0 COMMENT '裁决: 0=待审核, 1=通过, -1=不通过, -2=待人工确认',
  `confidence` int NOT NULL DEFAULT 0 COMMENT '最终置信度 0-100',
  `fail_reasons` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT '不通过原因(各fail agent拼接)',
  `agent_results` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT '4+1个agent的完整JSON输出',
  `status` int NOT NULL DEFAULT 0 COMMENT '处理状态: 0=AI审核中, 1=AI审核完成待自动处理, 2=已自动处理, 3=待人工确认, 4=人工已确认',
  `admin_id` bigint NULL DEFAULT NULL COMMENT '人工确认的管理员ID',
  `admin_verdict` int NULL DEFAULT NULL COMMENT '管理员裁决: 1=通过, -1=不通过',
  `admin_note` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '管理员备注',
  `reviewed_at` datetime NULL DEFAULT NULL COMMENT '管理员确认时间',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `track_review_records_track_id_idx`(`track_id` ASC) USING BTREE,
  INDEX `track_review_records_status_idx`(`status` ASC) USING BTREE,
  INDEX `track_review_records_verdict_idx`(`verdict` ASC) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '歌曲AI审核记录表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for track_video_resources
-- ----------------------------
DROP TABLE IF EXISTS `track_video_resources`;
CREATE TABLE `track_video_resources`  (
  `id` bigint NOT NULL COMMENT '雪花算法唯一ID',
  `track_id` bigint NOT NULL COMMENT '关联单曲ID',
  `quality` int NOT NULL DEFAULT 1 COMMENT '清晰度/画质: 0为标清(360p), 1为高清(720p), 2为超清(1080p), 3为4K极清(4k)',
  `resolution` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '物理分辨率 (如 1920x1080)',
  `fps` int NOT NULL DEFAULT 30 COMMENT '帧率 (如 30, 60)',
  `format` int NOT NULL DEFAULT 0 COMMENT '视频封装格式: 0为mp4, 1为webm, 2为mkv',
  `bitrate` int NOT NULL COMMENT '视频码率 (如 2500000, 8000000)',
  `stream_url` varchar(1000) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'MV视频流媒体播放地址',
  `size` bigint NOT NULL COMMENT '文件大小 (字节)',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `track_video_resources_track_id_idx`(`track_id` ASC) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for tracks
-- ----------------------------
DROP TABLE IF EXISTS `tracks`;
CREATE TABLE `tracks`  (
  `id` bigint NOT NULL COMMENT '雪花算法唯一ID',
  `album_id` bigint NOT NULL COMMENT '关联专辑ID',
  `title` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `duration` int NOT NULL COMMENT '时长（毫秒）',
  `lyrics_url` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '云端LRC歌词文件URL',
  `status` int NOT NULL DEFAULT 0 COMMENT '歌曲状态: 0:正常播放, 1:已下架, 2:为暂无版权,3:待审核',
  `liked_count` int NOT NULL DEFAULT 0 COMMENT '被收藏红心总次数',
  `play_count` bigint NOT NULL DEFAULT 0 COMMENT '流媒体总播放/播放次数',
  `track_number` int NOT NULL COMMENT '该曲目在专辑/碟片中的音轨顺序(从1开始)',
  `disc_number` int NOT NULL DEFAULT 1 COMMENT '多碟CD专辑中的碟片序号(从1开始，单CD专辑默认为1)',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `member` int NOT NULL DEFAULT 0 COMMENT '歌曲是否为会员歌曲，0-非会员，1-会员',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `tracks_album_id_idx`(`album_id` ASC) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for user_memberships
-- ----------------------------
DROP TABLE IF EXISTS `user_memberships`;
CREATE TABLE `user_memberships`  (
  `id` bigint NOT NULL COMMENT '雪花算法唯一ID',
  `user_id` bigint NOT NULL COMMENT '用户ID',
  `plan_id` bigint NOT NULL COMMENT '会员方案ID',
  `order_id` bigint NOT NULL COMMENT '支付订单id',
  `start_date` datetime NOT NULL COMMENT '会员生效时间',
  `end_date` datetime NOT NULL COMMENT '会员到期时间',
  `status` int NOT NULL DEFAULT 1 COMMENT '状态: 0=已过期, 1=生效中, 2=已取消',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `user_memberships_user_id_idx`(`user_id` ASC) USING BTREE,
  INDEX `user_memberships_plan_id_idx`(`plan_id` ASC) USING BTREE,
  INDEX `user_memberships_end_date_idx`(`end_date` ASC) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for users
-- ----------------------------
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users`  (
  `id` bigint NOT NULL COMMENT '雪花算法唯一ID',
  `email` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `password_hash` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `display_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `avatar_url` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `country` char(2) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'CN' COMMENT '国家代码 (ISO-3166 2位代码)',
  `product` int NOT NULL DEFAULT 0 COMMENT '产品等级/订阅类型: 0为免费用户(free), 1为会员用户(premium)',
  `status` int NOT NULL DEFAULT 0 COMMENT '用户状态: 0为正常(active), -1为封禁(banned)',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `users_email_key`(`email` ASC) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

SET FOREIGN_KEY_CHECKS = 1;
