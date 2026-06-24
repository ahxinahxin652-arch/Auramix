package com.son.auramix.domain.dto.admin;

import lombok.Data;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;

@Data
public class TrackAudioResourceDto {
    @Min(0)
    @Max(2)
    private Integer quality; // 0=low, 1=med/high, 2=lossless
    
    @Min(0)
    @Max(3)
    private Integer format; // 0=mp3, 1=flac, 2=m4a, 3=ogg
    
    private Integer bitrate;
    private String streamUrl;
    private Long size;
}
