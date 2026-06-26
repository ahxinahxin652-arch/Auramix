package com.son.auramix.controller.user;

import com.son.auramix.common.result.PageResult;
import com.son.auramix.common.result.Result;
import com.son.auramix.domain.dto.user.PlaylistCreateDTO;
import com.son.auramix.domain.dto.user.PlaylistTracksDTO;
import com.son.auramix.domain.dto.user.PlaylistUpdateDTO;
import com.son.auramix.domain.vo.user.PlaylistDetailVO;
import com.son.auramix.domain.vo.user.PlaylistSearchItemVO;
import com.son.auramix.domain.vo.user.PlaylistVO;
import com.son.auramix.service.user.PlaylistService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

/**
 * 用户歌单接口
 */
@RestController
@RequestMapping("/api/user/playlists")
@RequiredArgsConstructor
public class PlaylistController {

    private final PlaylistService playlistService;

    // ============================ 创建歌单 ============================

    @PostMapping
    public Result<PlaylistVO> create(@Valid @RequestBody PlaylistCreateDTO req) {
        PlaylistVO resp = playlistService.createPlaylist(req);
        return Result.success(resp, "歌单创建成功");
    }

    // ============================ 更新歌单 ============================

    @PutMapping("/{playlistId}")
    public Result<Void> update(@PathVariable Long playlistId,
                               @Valid @RequestBody PlaylistUpdateDTO req) {
        playlistService.updatePlaylist(playlistId, req);
        return Result.success(null, "歌单已更新");
    }

    // ============================ 删除歌单 ============================

    @DeleteMapping("/{playlistId}")
    public Result<Void> delete(@PathVariable Long playlistId) {
        playlistService.deletePlaylist(playlistId);
        return Result.success(null, "歌单已删除");
    }

    // ============================ 我的歌单列表 ============================

    @GetMapping
    public Result<PageResult<PlaylistVO>> listMyPlaylists(
            @RequestParam(required = false, defaultValue = "1") Integer pageNum,
            @RequestParam(required = false, defaultValue = "10") Integer pageSize) {
        return Result.success(playlistService.listMyPlaylists(pageNum, pageSize));
    }

    // ============================ 搜索公开歌单 ============================

    @GetMapping("/search")
    public Result<PageResult<PlaylistSearchItemVO>> search(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false, defaultValue = "1") Integer pageNum,
            @RequestParam(required = false, defaultValue = "10") Integer pageSize) {
        return Result.success(playlistService.searchPublicPlaylists(keyword, pageNum, pageSize));
    }

    // ============================ 歌单详情 ============================

    @GetMapping("/{playlistId}")
    public Result<PlaylistDetailVO> detail(@PathVariable Long playlistId) {
        return Result.success(playlistService.getPlaylistDetail(playlistId));
    }

    // ============================ 添加歌曲到歌单 ============================

    @PostMapping("/{playlistId}/tracks")
    public Result<Void> addTracks(@PathVariable Long playlistId,
                                  @Valid @RequestBody PlaylistTracksDTO req) {
        playlistService.addTracks(playlistId, req);
        return Result.success(null, "歌曲已添加到歌单");
    }

    // ============================ 从歌单移除歌曲 ============================

    @DeleteMapping("/{playlistId}/tracks")
    public Result<Void> removeTracks(@PathVariable Long playlistId,
                                     @Valid @RequestBody PlaylistTracksDTO req) {
        playlistService.removeTracks(playlistId, req);
        return Result.success(null, "歌曲已从歌单移除");
    }

    // ============================ 关注歌单 ============================

    @PostMapping("/{playlistId}/follow")
    public Result<Void> follow(@PathVariable Long playlistId) {
        playlistService.followPlaylist(playlistId);
        return Result.success(null, "已关注歌单");
    }

    // ============================ 取消关注 ============================

    @DeleteMapping("/{playlistId}/follow")
    public Result<Void> unfollow(@PathVariable Long playlistId) {
        playlistService.unfollowPlaylist(playlistId);
        return Result.success(null, "已取消关注");
    }

    // ============================ 我关注的歌单列表 ============================

    @GetMapping("/followed")
    public Result<PageResult<PlaylistSearchItemVO>> listFollowed(
            @RequestParam(required = false, defaultValue = "1") Integer pageNum,
            @RequestParam(required = false, defaultValue = "10") Integer pageSize) {
        return Result.success(playlistService.listFollowedPlaylists(pageNum, pageSize));
    }
}
