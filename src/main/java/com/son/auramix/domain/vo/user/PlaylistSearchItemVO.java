package com.son.auramix.domain.vo.user;

import lombok.Data;

import java.time.LocalDateTime;

/**
 * 搜索结果条目
 */
@Data
public class PlaylistSearchItemVO {
    private Long id;
    private String name;
    private String description;
    private String coverUrl;
    private String ownerName;
    private Integer trackCount;
    private Integer followerCount;
    private LocalDateTime createdAt;
}
