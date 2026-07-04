package com.son.auramix.domain.vo.user;

import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.fasterxml.jackson.databind.ser.std.ToStringSerializer;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;
import com.son.auramix.domain.vo.admin.GenreVO;

@Data
public class UserTrackDetailVO {
    @JsonSerialize(using = ToStringSerializer.class)
    private Long id;
    private String title;
    @JsonSerialize(using = ToStringSerializer.class)
    private Long albumId;
    private String albumTitle;
    private String coverUrl;
    private Integer duration;
    private Integer member;
    private Integer trackNumber;
    private Integer discNumber;
    private List<ArtistInfoVO> artists;
    private List<GenreVO> genres;
    private String lyricsUrl;
    private String format;
    private Long size;
    private String audioUrl;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    /** 上下文不为 "similar" 时返回的相似推荐歌单 */
    private List<RecommendTrackVO> similarTracks;
}
