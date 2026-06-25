package com.son.auramix.domain.dto.admin;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class ArtistDetailResponse {
    private Long id;
    private String name;
    private String coverImg;
    private String bio;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
