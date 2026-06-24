package com.son.auramix.domain.dto.admin;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class TrackListItemResponse {
    private String id; // Serialized as String to prevent precision loss in JS
    private String title;
    private String albumId;
    private String albumTitle;
    private String albumCover;
    private List<TrackArtistDto> artists;
    private Integer status;
    private Integer trackNumber;
    private Integer discNumber;
    private Boolean hasAudio;
    private Boolean hasVideo;
    private LocalDateTime createdAt;
}
