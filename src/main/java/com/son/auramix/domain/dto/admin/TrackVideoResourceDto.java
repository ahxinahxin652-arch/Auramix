package com.son.auramix.domain.dto.admin;

import lombok.Data;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

@Data
public class TrackVideoResourceDto {
    @NotNull(message = "Quality is required")
    @Min(0)
    @Max(3)
    private Integer quality; // 0=360p, 1=720p, 2=1080p, 3=4K
    
    @NotBlank(message = "Resolution is required")
    @Size(max = 20, message = "Resolution cannot exceed 20 characters")
    private String resolution;
    
    @NotNull(message = "FPS is required")
    @Min(value = 1, message = "FPS must be at least 1")
    private Integer fps;
    
    @NotNull(message = "Format is required")
    @Min(0)
    @Max(2)
    private Integer format; // 0=mp4, 1=webm, 2=mkv
    
    @NotNull(message = "Bitrate is required")
    @Min(value = 1, message = "Bitrate must be at least 1")
    private Integer bitrate;
    
    @NotBlank(message = "Stream URL is required")
    @Size(max = 1000, message = "Stream URL cannot exceed 1000 characters")
    private String streamUrl;
    
    @NotNull(message = "File size is required")
    @Min(value = 0, message = "File size cannot be negative")
    private Long size;
}
