package com.son.auramix.domain.vo.admin;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class ArtistListItemVO {
    private Long id;
    private String name;
    private String coverImg;
    private String bio;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
