package com.son.auramix.domain.vo.admin;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class AlbumDetailVO {
    private Long id;
    private String title;
    private Integer albumType;
    private String coverUrl;
    private LocalDateTime releaseDate;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    /** 关联的歌手列表 */
    private List<AlbumArtistDto> artists;

    @Data
    public static class AlbumArtistDto {
        private Long artistId;
        private String artistName;
    }
}
