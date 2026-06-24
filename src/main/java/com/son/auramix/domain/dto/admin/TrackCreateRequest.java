package com.son.auramix.domain.dto.admin;

import lombok.Data;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.util.List;

@Data
public class TrackCreateRequest {
    @NotBlank(message = "Song title cannot be blank")
    private String title;
    
    @NotNull(message = "Album must be associated")
    private Long albumId;
    
    @NotNull(message = "Track number is required")
    @Min(value = 1, message = "Track number must be at least 1")
    private Integer trackNumber;
    
    private Integer discNumber;
    private Integer status;
    private String lyricsUrl;
    
    @NotNull(message = "Duration is required")
    @Min(value = 0, message = "Duration cannot be negative")
    private Integer duration; // in milliseconds
    
    @NotEmpty(message = "At least one artist must be specified")
    @Valid
    private List<TrackArtistDto> artists;
    
    @Valid
    private List<TrackAudioResourceDto> audioResources;
    
    @Valid
    private List<TrackVideoResourceDto> videoResources;
}
