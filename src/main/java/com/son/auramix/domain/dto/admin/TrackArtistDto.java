package com.son.auramix.domain.dto.admin;

import lombok.Data;

@Data
public class TrackArtistDto {
    private Long artistId;
    private String artistName;
    private Integer role; // 0=Main, 1=Feat, 2=Composer
}
