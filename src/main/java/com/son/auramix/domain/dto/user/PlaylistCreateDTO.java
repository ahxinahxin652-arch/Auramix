package com.son.auramix.domain.dto.user;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

/**
 * 用户创建歌单请求
 */
@Data
public class PlaylistCreateDTO {

    @NotBlank(message = "歌单名称不能为空")
    @Size(max = 100, message = "歌单名称最长 100 个字符")
    private String name;

    @Size(max = 500, message = "歌单描述最长 500 个字符")
    private String description;

    private String coverUrl;

    /** 0=私密 1=公开，默认私密 */
    private Boolean isPublic;
}
