package com.son.auramix.domain.dto.admin;

import lombok.Data;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

@Data
public class TrackAudioResourceDto {
    @NotNull(message = "Quality is required")
    @Min(0)
    @Max(2)
    private Integer quality; // 0=low, 1=med/high, 2=lossless
    
    @NotNull(message = "Format is required")
    @Min(0)
    @Max(3)
    private Integer format; // 0=mp3, 1=flac, 2=m4a, 3=ogg
    
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
