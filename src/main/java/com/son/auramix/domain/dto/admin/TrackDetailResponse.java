package com.son.auramix.domain.dto.admin;

import lombok.Data;
import java.util.List;

@Data
public class TrackDetailResponse {
    private String id;
    private String title;
    private String albumId;
    private String albumTitle;
    private Integer trackNumber;
    private Integer discNumber;
    private Integer status;
    private String lyricsUrl;
    private List<TrackArtistDto> artists;
    private List<TrackAudioResourceDto> audioResources;
    private List<TrackVideoResourceDto> videoResources;
}
