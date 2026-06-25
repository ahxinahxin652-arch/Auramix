package com.son.auramix.controller.user;

import com.son.auramix.common.result.Result;
import com.son.auramix.domain.dto.user.PlaylistCreateDTO;
import com.son.auramix.domain.vo.user.PlaylistVO;
import com.son.auramix.domain.dto.user.PlaylistTracksDTO;
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

    // ============================ 删除歌单 ============================

    @DeleteMapping("/{playlistId}")
    public Result<Void> delete(@PathVariable Long playlistId) {
        playlistService.deletePlaylist(playlistId);
        return Result.success(null, "歌单已删除");
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
}
