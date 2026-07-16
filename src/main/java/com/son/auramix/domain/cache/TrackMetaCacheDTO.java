package com.son.auramix.domain.cache;

import lombok.Data;
import java.io.Serializable;
import java.util.List;

@Data
public class TrackMetaCacheDTO implements Serializable {
    private static final long serialVersionUID = 1L;

    private String title;
    private Integer duration;
    private String coverUrl;
    private Long albumId;
    private String albumTitle;
    private Integer member;
    private List<ArtistRelation> artistRelations;
    private List<GenreMeta> genres;

    @Data
    public static class ArtistRelation implements Serializable {
        private static final long serialVersionUID = 1L;
        private Long artistId;
        private Integer role;
    }

    @Data
    public static class GenreMeta implements Serializable {
        private static final long serialVersionUID = 1L;
        private Long id;
        private String name;
    }
}
