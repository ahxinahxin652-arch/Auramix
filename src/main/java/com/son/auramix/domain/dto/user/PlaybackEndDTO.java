package com.son.auramix.domain.dto.user;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

/**
 * 播放结束上报参数.
 * <p>
 * 前端在切换歌曲/暂停/自然结束/关闭页面时上报，后端据此更新 user_behavior_logs 的 behavior_type 和 behavior_duration。
 */
@Data
public class PlaybackEndDTO {

    /** 用户ID */
    private Long userId;

    /** 曲目ID */
    @NotNull
    private Long trackId;

    /** 实际听了多少秒（核心） */
    private Integer playDuration;

    /** 歌曲总秒数 */
    private Integer totalDuration;

    /**
     * 触发结束的事件：NEXT(下一首) / STOP(暂停) / COMPLETE(自然结束) / CLOSE(关闭页面)
     * 空字符串表示非结束事件（仅更新 Redis 缓存）
     */
    private String eventType;

    /** 时间戳（秒） */
    private Long timestamp;
}
