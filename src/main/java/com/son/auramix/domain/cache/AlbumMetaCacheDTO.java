package com.son.auramix.domain.cache;

import lombok.Data;

import java.io.Serializable;
import java.time.LocalDateTime;

@Data
public class AlbumMetaCacheDTO implements Serializable {
    private static final long serialVersionUID = 1L;
    
    private String title;
    private String coverUrl;
    private LocalDateTime releaseDate;
    private Integer albumType;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
