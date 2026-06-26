package com.son.auramix.domain.dto.user;

import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

import java.util.List;

/**
 * 歌单歌曲操作请求（添加 / 移除共用）
 */
@Data
public class PlaylistTracksDTO {

    @NotEmpty(message = "歌曲 ID 列表不能为空")
    private List<Long> trackIds;
}
