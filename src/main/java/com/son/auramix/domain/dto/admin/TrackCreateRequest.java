package com.son.auramix.domain.dto.admin;

import lombok.Data;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.List;

@Data
public class TrackCreateRequest {
    @NotBlank(message = "Song title cannot be blank")
    private String title;
    @NotNull(message = "Album must be associated")
    private Long albumId;
    private Integer trackNumber;
    private Integer discNumber;
    private Integer status;
    private String lyricsUrl;
    private List<TrackArtistDto> artists;
    private List<TrackAudioResourceDto> audioResources;
    private List<TrackVideoResourceDto> videoResources;
}
