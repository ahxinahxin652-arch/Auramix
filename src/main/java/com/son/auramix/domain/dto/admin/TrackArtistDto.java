package com.son.auramix.domain.dto.admin;

import lombok.Data;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

@Data
public class TrackArtistDto {
    @NotNull(message = "Artist ID is required")
    private Long artistId;
    
    private String artistName;
    
    @NotNull(message = "Artist role is required")
    @Min(0)
    @Max(2)
    private Integer role; // 0=Main, 1=Feat, 2=Composer
}
