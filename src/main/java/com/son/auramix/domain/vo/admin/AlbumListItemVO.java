package com.son.auramix.domain.vo.admin;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class AlbumListItemVO {
    private Long id;
    private String title;
    private Integer albumType;
    private String coverUrl;
    private LocalDateTime releaseDate;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
