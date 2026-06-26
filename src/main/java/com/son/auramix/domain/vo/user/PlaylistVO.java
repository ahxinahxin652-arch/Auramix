package com.son.auramix.domain.vo.user;

import lombok.Data;

import java.time.LocalDateTime;

/**
 * 歌单响应
 */
@Data
public class PlaylistVO {

    private Long id;
    private Long ownerId;
    private String name;
    private String description;
    private String coverUrl;
    private Boolean isPublic;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
