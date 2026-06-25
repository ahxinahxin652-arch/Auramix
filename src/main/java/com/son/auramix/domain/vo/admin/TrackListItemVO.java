package com.son.auramix.domain.vo.admin;

import com.son.auramix.domain.dto.admin.TrackArtistDto;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class TrackListItemVO {
    private Long id;
    private String title;
    private Long albumId;
    private String albumTitle;
    private String albumCover;
    private List<TrackArtistDto> artists;
    private Integer status;
    private Integer trackNumber;
    private Integer discNumber;
    private Integer duration; // in milliseconds
    private Integer likedCount;
    private Long playCount;
    private Boolean hasAudio;
    private Boolean hasVideo;
    private LocalDateTime createdAt;
}
