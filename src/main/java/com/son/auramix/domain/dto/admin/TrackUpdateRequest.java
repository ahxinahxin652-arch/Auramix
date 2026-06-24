package com.son.auramix.domain.dto.admin;

import lombok.Data;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.List;

@Data
public class TrackUpdateRequest {
    @NotBlank(message = "Song title cannot be blank")
    private String title;
    @NotNull(message = "Album must be associated")
    private Long albumId;
    private Integer trackNumber;
    private Integer discNumber;
    private Integer status;
    private String lyricsUrl;
    private Integer duration; // in milliseconds
    
    @Valid
    private List<TrackArtistDto> artists;
    
    @Valid
    private List<TrackAudioResourceDto> audioResources;
    
    @Valid
    private List<TrackVideoResourceDto> videoResources;
}
