package com.son.auramix.service.user;

import com.son.auramix.common.result.PageResult;
import com.son.auramix.domain.vo.user.*;

public interface UserSearchService {

    /**
     * 搜索音乐库（聚合所有类型，返回少量）
     */
    GlobalSearchVO searchAll(String keyword);

    /**
     * 搜索单曲
     */
    PageResult<UserTrackSearchVO> searchTracks(String keyword, Integer pageNum, Integer pageSize);

    /**
     * 搜索歌手
     */
    PageResult<UserArtistSearchVO> searchArtists(String keyword, Integer pageNum, Integer pageSize);

    /**
     * 搜索专辑
     */
    PageResult<UserAlbumSearchVO> searchAlbums(String keyword, Integer pageNum, Integer pageSize);

    /**
     * 搜索歌单
     */
    PageResult<PlaylistSearchItemVO> searchPlaylists(String keyword, Integer pageNum, Integer pageSize);
}
