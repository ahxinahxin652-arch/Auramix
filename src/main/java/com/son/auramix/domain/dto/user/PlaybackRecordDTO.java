package com.son.auramix.domain.dto.user;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

/**
 * 播放记录请求
 */
@Data
public class PlaybackRecordDTO {

    @NotNull(message = "歌曲 ID 不能为空")
    private Long trackId;

    /** 播放来源类型：0=歌单 1=专辑 2=歌手页，不传则不记录来源 */
    private Integer contextType;

    /** 来源 ID（歌单 ID / 专辑 ID / 歌手 ID） */
    private Long contextId;
}
