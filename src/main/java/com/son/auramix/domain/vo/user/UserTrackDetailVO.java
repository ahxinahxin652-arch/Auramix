package com.son.auramix.domain.vo.user;

import lombok.Data;
import java.util.List;
import com.son.auramix.domain.vo.admin.GenreVO;

@Data
public class UserTrackDetailVO {
    private Long id;
    private String title;
    private Long albumId;
    private String albumTitle;
    private String coverUrl;
    private Integer duration;
    private Integer member;
    private List<ArtistInfoVO> artists;
    private List<GenreVO> genres;
    private String lyricsUrl;
    private String format;
    private Long size;
    private String audioUrl;

    /** 上下文不为 "similar" 时返回的相似推荐歌单 */
    private List<RecommendTrackVO> similarTracks;
}
