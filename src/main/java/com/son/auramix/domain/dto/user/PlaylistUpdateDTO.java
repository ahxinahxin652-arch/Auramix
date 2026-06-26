package com.son.auramix.domain.dto.user;

import jakarta.validation.constraints.Size;
import lombok.Data;

/**
 * 更新歌单请求（所有字段可选，传 null 表示不修改）
 */
@Data
public class PlaylistUpdateDTO {

    @Size(max = 100, message = "歌单名称最长 100 个字符")
    private String name;

    @Size(max = 500, message = "歌单描述最长 500 个字符")
    private String description;

    private String coverUrl;

    /** 0=私密 1=公开 */
    private Boolean isPublic;

    /** 是否清除封面（设为 true 时 coverUrl 置空） */
    private Boolean clearCover;
}
