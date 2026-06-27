package com.son.auramix.domain.vo.user;

import lombok.Data;
import java.util.List;
import java.util.Map;

@Data
public class UserArtistDetailVO {
    private Long id;
    private String name;
    private String coverImg;
    private String metadata; // JSON string containing birthPlace, description, links
    private List<UserTrackSearchVO> tracks;
}
