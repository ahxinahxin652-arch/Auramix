package com.son.auramix.domain.vo.user;

import lombok.Data;

/**
 * 歌单内歌曲条�?
 */
@Data
public class PlaylistTrackItemVO {
    private Long trackId;
    private String title;
    private Integer duration;
    private String coverUrl;       // 专辑封面
    private String albumTitle;
    private Long albumId;
    private java.util.List<ArtistInfoVO> artists;
    private Integer sortOrder;
}
