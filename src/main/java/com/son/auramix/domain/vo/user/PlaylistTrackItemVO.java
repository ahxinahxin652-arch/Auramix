package com.son.auramix.domain.vo.user;

import lombok.Data;
import com.son.auramix.domain.vo.admin.GenreVO;

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
    private java.util.List<GenreVO> genres;
    private Integer sortOrder;
}
