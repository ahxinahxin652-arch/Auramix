package com.son.auramix.domain.dto.admin;

import lombok.Data;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;

@Data
public class TrackArtistDto {
    private Long artistId;
    private String artistName;
    
    @Min(0)
    @Max(2)
    private Integer role; // 0=Main, 1=Feat, 2=Composer
}
