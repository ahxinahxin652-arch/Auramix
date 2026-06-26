package com.son.auramix.domain.vo.user;

import lombok.Data;

/**
 * 歌单内歌曲条目
 */
@Data
public class PlaylistTrackItemVO {
    private Long trackId;
    private String title;
    private Integer duration;
    private String coverUrl;       // 专辑封面
    private String albumTitle;
    private java.util.List<String> artistNames;
    private Integer sortOrder;
}
