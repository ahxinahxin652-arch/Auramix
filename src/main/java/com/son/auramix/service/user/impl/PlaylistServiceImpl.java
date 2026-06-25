package com.son.auramix.service.user.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.son.auramix.common.exception.BusinessException;
import com.son.auramix.common.result.ResultCode;
import com.son.auramix.domain.dto.user.PlaylistCreateDTO;
import com.son.auramix.domain.vo.user.PlaylistVO;
import com.son.auramix.domain.dto.user.PlaylistTracksDTO;
import com.son.auramix.domain.entity.Playlist;
import com.son.auramix.domain.entity.PlaylistTrack;
import com.son.auramix.mapper.PlaylistMapper;
import com.son.auramix.mapper.PlaylistTrackMapper;
import com.son.auramix.security.user.UserPrincipal;
import com.son.auramix.service.user.PlaylistService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * 用户歌单服务实现
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class PlaylistServiceImpl implements PlaylistService {

    private final PlaylistMapper playlistMapper;
    private final PlaylistTrackMapper playlistTrackMapper;

    /**
     * 从 SecurityContextHolder 获取当前登录用户 ID
     */
    private Long getCurrentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof UserPrincipal principal) {
            return principal.getUserId();
        }
        throw new BusinessException(ResultCode.UNAUTHORIZED);
    }

    @Override
    public PlaylistVO createPlaylist(PlaylistCreateDTO req) {
        Long ownerId = getCurrentUserId();
        Playlist playlist = new Playlist();
        playlist.setOwnerId(ownerId);
        playlist.setName(req.getName());
        playlist.setDescription(req.getDescription());
        playlist.setCoverUrl(req.getCoverUrl());
        playlist.setIsPublic(req.getIsPublic() != null ? req.getIsPublic() : Boolean.FALSE);
        playlistMapper.insert(playlist);

        return toResponse(playlist);
    }

    @Override
    @Transactional
    public void deletePlaylist(Long playlistId) {
        Long ownerId = getCurrentUserId();
        Playlist playlist = getOwnedPlaylist(ownerId, playlistId);

        // 级联删除歌单-歌曲关联（仅删除关联，不删除歌曲本身）
        playlistTrackMapper.delete(
                new LambdaQueryWrapper<PlaylistTrack>().eq(PlaylistTrack::getPlaylistId, playlistId));

        // 删除歌单本身
        playlistMapper.deleteById(playlist.getId());

        log.info("[PlaylistService] 删除歌单 playlistId={}, ownerId={}", playlistId, ownerId);
    }

    @Override
    @Transactional
    public void addTracks(Long playlistId, PlaylistTracksDTO req) {
        Long ownerId = getCurrentUserId();
        getOwnedPlaylist(ownerId, playlistId);

        List<Long> trackIds = req.getTrackIds();

        // 查询当前歌单中已存在的歌曲关联，过滤重复
        List<PlaylistTrack> existing = playlistTrackMapper.selectList(
                new LambdaQueryWrapper<PlaylistTrack>()
                        .eq(PlaylistTrack::getPlaylistId, playlistId)
                        .in(PlaylistTrack::getTrackId, trackIds));
        List<Long> existingTrackIds = existing.stream()
                .map(PlaylistTrack::getTrackId)
                .collect(Collectors.toList());

        // 计算当前最大排序号
        Integer maxSort = existing.stream()
                .map(PlaylistTrack::getSortOrder)
                .max(Integer::compareTo)
                .orElse(0);

        List<Long> toAdd = trackIds.stream()
                .filter(tid -> !existingTrackIds.contains(tid))
                .distinct()
                .collect(Collectors.toList());

        int sort = maxSort == null ? 0 : maxSort + 1;
        for (Long trackId : toAdd) {
            PlaylistTrack pt = new PlaylistTrack();
            pt.setPlaylistId(playlistId);
            pt.setTrackId(trackId);
            pt.setSortOrder(sort++);
            playlistTrackMapper.insert(pt);
        }

        log.info("[PlaylistService] 歌单添加歌曲 playlistId={}, added={}, skipped={}",
                playlistId, toAdd.size(), trackIds.size() - toAdd.size());
    }

    @Override
    @Transactional
    public void removeTracks(Long playlistId, PlaylistTracksDTO req) {
        Long ownerId = getCurrentUserId();
        getOwnedPlaylist(ownerId, playlistId);

        int deleted = playlistTrackMapper.delete(
                new LambdaQueryWrapper<PlaylistTrack>()
                        .eq(PlaylistTrack::getPlaylistId, playlistId)
                        .in(PlaylistTrack::getTrackId, req.getTrackIds()));

        log.info("[PlaylistService] 歌单移除歌曲 playlistId={}, deleted={}", playlistId, deleted);
    }

    // ============================ 私有方法 ============================

    /**
     * 查询歌单并校验归属权
     */
    private Playlist getOwnedPlaylist(Long ownerId, Long playlistId) {
        Playlist playlist = playlistMapper.selectById(playlistId);
        if (playlist == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "歌单不存在");
        }
        if (!ownerId.equals(playlist.getOwnerId())) {
            throw new BusinessException(ResultCode.FORBIDDEN, "无权操作该歌单");
        }
        return playlist;
    }

    private PlaylistVO toResponse(Playlist p) {
        PlaylistVO resp = new PlaylistVO();
        resp.setId(p.getId());
        resp.setOwnerId(p.getOwnerId());
        resp.setName(p.getName());
        resp.setDescription(p.getDescription());
        resp.setCoverUrl(p.getCoverUrl());
        resp.setIsPublic(p.getIsPublic());
        resp.setCreatedAt(p.getCreatedAt());
        resp.setUpdatedAt(p.getUpdatedAt());
        return resp;
    }
}
