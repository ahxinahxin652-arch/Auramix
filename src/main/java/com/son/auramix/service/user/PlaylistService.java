package com.son.auramix.service.user;

import com.son.auramix.common.result.PageResult;
import com.son.auramix.domain.dto.user.PlaylistCreateDTO;
import com.son.auramix.domain.dto.user.PlaylistTracksDTO;
import com.son.auramix.domain.dto.user.PlaylistUpdateDTO;
import com.son.auramix.domain.vo.user.PlaylistDetailVO;
import com.son.auramix.domain.vo.user.PlaylistSearchItemVO;
import com.son.auramix.domain.vo.user.PlaylistVO;
import org.springframework.web.multipart.MultipartFile;

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

    /** 更新歌单信息（仅创建者，所有字段可选） */
    void updatePlaylist(Long playlistId, PlaylistUpdateDTO req);

    /** 更新歌单信息 + 可选封面上传（合并 multipart） */
    PlaylistVO updatePlaylistWithCover(Long playlistId, PlaylistUpdateDTO req, MultipartFile cover);

    /** 我的歌单列表（含私密），分页 */
    PageResult<PlaylistVO> listMyPlaylists(Integer pageNum, Integer pageSize);

    /** 搜索公开歌单（按 name/description 模糊搜索），分页 */
    PageResult<PlaylistSearchItemVO> searchPublicPlaylists(String keyword, Integer pageNum, Integer pageSize);

    /** 歌单详情（公开=任何人，私密=仅创建者；含歌曲列表） */
    PlaylistDetailVO getPlaylistDetail(Long playlistId);

    /** 关注歌单（仅公开歌单，不能关注自己的） */
    void followPlaylist(Long playlistId);

    /** 取消关注（幂等） */
    void unfollowPlaylist(Long playlistId);

    /** 我关注的歌单列表，分页 */
    PageResult<PlaylistSearchItemVO> listFollowedPlaylists(Integer pageNum, Integer pageSize);
}
