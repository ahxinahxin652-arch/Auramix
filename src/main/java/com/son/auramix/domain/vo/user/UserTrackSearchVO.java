package com.son.auramix.domain.vo.user;

import lombok.Data;
import java.util.List;

@Data
public class UserTrackSearchVO {
    private Long id;
    private String title;
    private Integer duration;
    private String coverUrl;
    private Long albumId;
    private String albumTitle;
    private List<ArtistInfoVO> artists;
}
