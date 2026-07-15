package com.son.auramix.domain.cache;

import lombok.Data;
import java.io.Serializable;
import java.util.List;

@Data
public class TrackMetaCacheDTO implements Serializable {
    private static final long serialVersionUID = 1L;

    private Long id;
    private String title;
    private Integer duration;
    private String coverUrl;
    private Long albumId;
    private String albumTitle;
    private Integer member;
    private List<ArtistMeta> artists;
    private List<GenreMeta> genres;

    @Data
    public static class ArtistMeta implements Serializable {
        private static final long serialVersionUID = 1L;
        private Long id;
        private String name;
        private Integer role;
    }

    @Data
    public static class GenreMeta implements Serializable {
        private static final long serialVersionUID = 1L;
        private Long id;
        private String name;
    }
}
