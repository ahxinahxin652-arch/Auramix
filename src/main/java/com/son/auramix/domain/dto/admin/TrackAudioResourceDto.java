package com.son.auramix.domain.dto.admin;

import lombok.Data;

@Data
public class TrackAudioResourceDto {
    private Integer quality; // 0=low, 1=med/high, 2=lossless
    private Integer format; // 0=mp3, 1=flac, 2=m4a, 3=ogg
    private Integer bitrate;
    private String streamUrl;
    private Long size;
}
