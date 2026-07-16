package com.son.auramix.domain.cache;

import lombok.Data;

import java.io.Serializable;
import java.time.LocalDateTime;

@Data
public class PlaylistMetaCacheDTO implements Serializable {
    private static final long serialVersionUID = 1L;

    private Long ownerId;
    private String ownerName;
    private String name;
    private String description;
    private String coverUrl;
    private Boolean isPublic;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
