package com.son.auramix.domain.dto.admin;

import lombok.Data;

@Data
public class TrackVideoResourceDto {
    private Integer quality; // 0=360p, 1=720p, 2=1080p, 3=4K
    private String resolution;
    private Integer fps;
    private Integer format; // 0=mp4, 1=webm, 2=mkv
    private Integer bitrate;
    private String streamUrl;
    private Long size;
}
