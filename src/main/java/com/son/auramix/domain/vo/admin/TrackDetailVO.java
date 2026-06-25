package com.son.auramix.domain.vo.admin;

import com.son.auramix.domain.dto.admin.TrackArtistDto;
import com.son.auramix.domain.dto.admin.TrackAudioResourceDto;
import com.son.auramix.domain.dto.admin.TrackVideoResourceDto;
import lombok.Data;
import java.util.List;

@Data
public class TrackDetailVO {
    private Long id;
    private String title;
    private Long albumId;
    private String albumTitle;
    private Integer trackNumber;
    private Integer discNumber;
    private Integer status;
    private String lyricsUrl;
    private Integer duration; // in milliseconds
    private Integer likedCount;
    private Long playCount;
    private List<TrackArtistDto> artists;
    private List<TrackAudioResourceDto> audioResources;
    private List<TrackVideoResourceDto> videoResources;
}
