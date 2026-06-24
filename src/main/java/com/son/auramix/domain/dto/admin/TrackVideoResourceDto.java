package com.son.auramix.domain.dto.admin;

import lombok.Data;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;

@Data
public class TrackVideoResourceDto {
    @Min(0)
    @Max(3)
    private Integer quality; // 0=360p, 1=720p, 2=1080p, 3=4K
    
    private String resolution;
    private Integer fps;
    
    @Min(0)
    @Max(2)
    private Integer format; // 0=mp4, 1=webm, 2=mkv
    
    private Integer bitrate;
    private String streamUrl;
    private Long size;
}
