package com.son.auramix.domain.vo.user;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class UserAlbumDetailVO {
    private Long id;
    private String title;
    private String coverUrl;
    private LocalDateTime releaseDate;
    private Integer albumType;
    private List<UserTrackSearchVO> tracks;
}
