package com.son.auramix.service.user.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.son.auramix.domain.entity.ArtistFollower;
import com.son.auramix.domain.entity.Playlist;
import com.son.auramix.domain.entity.PlaylistTrack;
import com.son.auramix.domain.vo.user.UserLibrarySyncVO;
import com.son.auramix.domain.vo.user.UserPlaylistSyncVO;
import com.son.auramix.mapper.ArtistFollowerMapper;
import com.son.auramix.mapper.ArtistMapper;
import com.son.auramix.mapper.PlaylistMapper;
import com.son.auramix.mapper.PlaylistTrackMapper;
import com.son.auramix.service.user.UserLibraryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserLibraryServiceImpl implements UserLibraryService {

    private final PlaylistMapper playlistMapper;
    private final PlaylistTrackMapper playlistTrackMapper;
    private final ArtistFollowerMapper artistFollowerMapper;
    private final ArtistMapper artistMapper;

    @Override
    public UserLibrarySyncVO getLibrarySyncData(Long userId) {
        UserLibrarySyncVO syncVO = new UserLibrarySyncVO();
        
        // 1. 获取用户创建的所有歌单
        List<Playlist> myPlaylists = playlistMapper.selectList(
                new LambdaQueryWrapper<Playlist>().eq(Playlist::getOwnerId, userId)
        );
        
        List<UserPlaylistSyncVO> playlistSyncs = new ArrayList<>();
        for (Playlist p : myPlaylists) {
            UserPlaylistSyncVO pVo = new UserPlaylistSyncVO();
            pVo.setId(p.getId());
            pVo.setName(p.getName());
            pVo.setCoverUrl(p.getCoverUrl());
            
            // 获取歌单中的歌曲ID
            List<PlaylistTrack> pts = playlistTrackMapper.selectList(
                    new LambdaQueryWrapper<PlaylistTrack>().eq(PlaylistTrack::getPlaylistId, p.getId())
            );
            pVo.setTrackIds(pts.stream().map(PlaylistTrack::getTrackId).collect(Collectors.toList()));
            
            playlistSyncs.add(pVo);
        }
        syncVO.setPlaylists(playlistSyncs);
        
        // 2. 获取用户关注的歌手
        List<ArtistFollower> followers = artistFollowerMapper.selectList(
                new LambdaQueryWrapper<ArtistFollower>().eq(ArtistFollower::getUserId, userId)
        );
        List<Long> artistIds = followers.stream().map(ArtistFollower::getArtistId).collect(Collectors.toList());
        List<com.son.auramix.domain.vo.user.UserArtistSyncVO> artistSyncs = new ArrayList<>();
        if (!artistIds.isEmpty()) {
            List<com.son.auramix.domain.entity.Artist> artists = artistMapper.selectBatchIds(artistIds);
            for (com.son.auramix.domain.entity.Artist a : artists) {
                com.son.auramix.domain.vo.user.UserArtistSyncVO aVo = new com.son.auramix.domain.vo.user.UserArtistSyncVO();
                aVo.setId(a.getId());
                aVo.setName(a.getName());
                aVo.setCoverImg(a.getCoverImg());
                artistSyncs.add(aVo);
            }
        }
        syncVO.setFollowedArtists(artistSyncs);
        
        log.info("[UserLibraryService] 同步用户媒体库数据, userId={}, playlists={}, artists={}", userId, myPlaylists.size(), followers.size());
        return syncVO;
    }
}
