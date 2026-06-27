package com.son.auramix.domain.vo.user;

import lombok.Data;
import java.util.List;

@Data
public class GlobalSearchVO {
    private List<UserTrackSearchVO> tracks;
    private List<UserArtistSearchVO> artists;
    private List<UserAlbumSearchVO> albums;
    private List<PlaylistSearchItemVO> playlists;
}
