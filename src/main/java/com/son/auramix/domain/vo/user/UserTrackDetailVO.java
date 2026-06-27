package com.son.auramix.domain.vo.user;

import lombok.Data;
import java.util.List;

@Data
public class UserTrackDetailVO {
    private Long id;
    private String title;
    private Long albumId;
    private String albumTitle;
    private String coverUrl;
    private Integer duration;
    private List<String> artistNames;
    private String lyricsUrl;
    private String format;
    private Long size;
    private String audioUrl;
}
