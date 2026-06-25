package com.son.auramix.domain.dto.admin;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class AlbumListItemResponse {
    private Long id;
    private String title;
    private Integer albumType;
    private String coverUrl;
    private LocalDateTime releaseDate;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
