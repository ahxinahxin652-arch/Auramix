package com.son.auramix.domain.vo.user;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 歌单详情（含歌曲列表）
 */
@Data
public class PlaylistDetailVO {
    private Long id;
    private Long ownerId;
    private String ownerName;
    private String name;
    private String description;
    private String coverUrl;
    private Boolean isPublic;
    private Integer trackCount;
    private Integer followerCount;
    private Boolean isFollowing;
    private Boolean isOwner;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<PlaylistTrackItemVO> tracks;
}
