package com.son.auramix.domain.vo.user;

import lombok.Data;

import java.time.LocalDateTime;

/**
 * 播放历史响应
 */
@Data
public class PlaybackHistoryVO {

    private Long id;
    private Long userId;
    private Long trackId;
    private LocalDateTime playedAt;
    private Integer contextType;
    private Long contextId;
}
