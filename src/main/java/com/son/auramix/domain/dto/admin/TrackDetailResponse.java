package com.son.auramix.domain.dto.admin;

import lombok.Data;
import java.util.List;

@Data
public class TrackDetailResponse {
    private Long id;
    private String title;
    private Long albumId;
    private String albumTitle;
    private Integer trackNumber;
    private Integer discNumber;
    private Integer member;
    private Integer status;
    private String lyricsUrl;
    private Integer duration; // in milliseconds
    private Integer likedCount;
    private Long playCount;
    private List<TrackArtistDto> artists;
    private List<TrackAudioResourceDto> audioResources;
    private List<TrackVideoResourceDto> videoResources;
}
