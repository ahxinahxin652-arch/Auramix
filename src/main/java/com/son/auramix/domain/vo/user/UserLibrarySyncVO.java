package com.son.auramix.domain.vo.user;

import lombok.Data;
import java.util.List;

@Data
public class UserLibrarySyncVO {
    private List<UserPlaylistSyncVO> playlists;
    private List<UserArtistSyncVO> followedArtists;
}
