package com.son.auramix.service.user;

import com.son.auramix.domain.dto.user.PlaylistCreateDTO;
import com.son.auramix.domain.vo.user.PlaylistVO;
import com.son.auramix.domain.dto.user.PlaylistTracksDTO;

/**
 * 用户歌单服务
 */
public interface PlaylistService {

    /** 创建歌单 */
    PlaylistVO createPlaylist(PlaylistCreateDTO req);

    /** 删除歌单（级联删除歌单-歌曲关联，不删除歌曲本身） */
    void deletePlaylist(Long playlistId);

    /** 向歌单添加歌曲（幂等：已存在的关联跳过） */
    void addTracks(Long playlistId, PlaylistTracksDTO req);

    /** 从歌单移除歌曲（仅删除关联，不删除歌曲本身） */
    void removeTracks(Long playlistId, PlaylistTracksDTO req);
}
