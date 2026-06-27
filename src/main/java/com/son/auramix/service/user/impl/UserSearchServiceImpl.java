package com.son.auramix.service.user.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.son.auramix.common.result.PageResult;
import com.son.auramix.domain.entity.*;
import com.son.auramix.domain.vo.user.*;
import com.son.auramix.mapper.*;
import com.son.auramix.service.user.PlaylistService;
import com.son.auramix.service.user.UserSearchService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserSearchServiceImpl implements UserSearchService {

    private final TrackMapper trackMapper;
    private final ArtistMapper artistMapper;
    private final AlbumMapper albumMapper;
    private final PlaylistMapper playlistMapper;
    private final TrackArtistMapper trackArtistMapper;
    private final PlaylistService playlistService;

    @Override
    public GlobalSearchVO searchAll(String keyword) {
        GlobalSearchVO vo = new GlobalSearchVO();
        vo.setTracks(searchTracks(keyword, 1, 5).getRecords());
        vo.setArtists(searchArtists(keyword, 1, 5).getRecords());
        vo.setAlbums(searchAlbums(keyword, 1, 5).getRecords());
        vo.setPlaylists(searchPlaylists(keyword, 1, 5).getRecords());
        return vo;
    }

    @Override
    public PageResult<UserTrackSearchVO> searchTracks(String keyword, Integer pageNum, Integer pageSize) {
        Page<Track> page = new Page<>(pageNum, pageSize);
        LambdaQueryWrapper<Track> wrapper = new LambdaQueryWrapper<>();
        // status 0 = normal (正常)
        wrapper.eq(Track::getStatus, 0);
        if (keyword != null && !keyword.trim().isEmpty()) {
            wrapper.like(Track::getTitle, keyword.trim());
        }
        trackMapper.selectPage(page, wrapper);

        List<Track> tracks = page.getRecords();
        if (tracks.isEmpty()) {
            return new PageResult<>(page.getCurrent(), page.getSize(), page.getTotal(), page.getPages(), new ArrayList<>());
        }

        List<Long> trackIds = tracks.stream().map(Track::getId).collect(Collectors.toList());
        List<Long> albumIds = tracks.stream().map(Track::getAlbumId).filter(Objects::nonNull).distinct().collect(Collectors.toList());

        Map<Long, Album> albumMap = albumIds.isEmpty() ? new HashMap<>() : 
                albumMapper.selectBatchIds(albumIds).stream().collect(Collectors.toMap(Album::getId, a -> a));

        List<TrackArtist> trackArtists = trackArtistMapper.selectList(
                new LambdaQueryWrapper<TrackArtist>().in(TrackArtist::getTrackId, trackIds));
        List<Long> artistIds = trackArtists.stream().map(TrackArtist::getArtistId).distinct().collect(Collectors.toList());
        
        Map<Long, Artist> artistMap = artistIds.isEmpty() ? new HashMap<>() :
                artistMapper.selectBatchIds(artistIds).stream().collect(Collectors.toMap(Artist::getId, a -> a));
        
        Map<Long, List<TrackArtist>> trackArtistsByTrack = trackArtists.stream()
                .collect(Collectors.groupingBy(TrackArtist::getTrackId));

        List<UserTrackSearchVO> list = tracks.stream().map(t -> {
            UserTrackSearchVO vo = new UserTrackSearchVO();
            vo.setId(t.getId());
            vo.setTitle(t.getTitle());
            vo.setDuration(t.getDuration());
            
            Album album = albumMap.get(t.getAlbumId());
            if (album != null) {
                vo.setAlbumId(album.getId());
                vo.setAlbumTitle(album.getTitle());
                vo.setCoverUrl(album.getCoverUrl());
            }

            List<TrackArtist> tas = trackArtistsByTrack.getOrDefault(t.getId(), new ArrayList<>());
            List<String> aNames = new ArrayList<>();
            List<Long> aIds = new ArrayList<>();
            for (TrackArtist ta : tas) {
                Artist a = artistMap.get(ta.getArtistId());
                if (a != null) {
                    aNames.add(a.getName());
                    aIds.add(a.getId());
                }
            }
            vo.setArtistNames(aNames);
            vo.setArtistIds(aIds);
            
            return vo;
        }).collect(Collectors.toList());

        return new PageResult<>(page.getCurrent(), page.getSize(), page.getTotal(), page.getPages(), list);
    }

    @Override
    public PageResult<UserArtistSearchVO> searchArtists(String keyword, Integer pageNum, Integer pageSize) {
        Page<Artist> page = new Page<>(pageNum, pageSize);
        LambdaQueryWrapper<Artist> wrapper = new LambdaQueryWrapper<>();
        if (keyword != null && !keyword.trim().isEmpty()) {
            wrapper.like(Artist::getName, keyword.trim());
        }
        artistMapper.selectPage(page, wrapper);

        List<UserArtistSearchVO> list = page.getRecords().stream().map(a -> {
            UserArtistSearchVO vo = new UserArtistSearchVO();
            vo.setId(a.getId());
            vo.setName(a.getName());
            vo.setCoverImg(a.getCoverImg());
            return vo;
        }).collect(Collectors.toList());

        return new PageResult<>(page.getCurrent(), page.getSize(), page.getTotal(), page.getPages(), list);
    }

    @Override
    public PageResult<UserAlbumSearchVO> searchAlbums(String keyword, Integer pageNum, Integer pageSize) {
        Page<Album> page = new Page<>(pageNum, pageSize);
        LambdaQueryWrapper<Album> wrapper = new LambdaQueryWrapper<>();
        if (keyword != null && !keyword.trim().isEmpty()) {
            wrapper.like(Album::getTitle, keyword.trim());
        }
        albumMapper.selectPage(page, wrapper);

        List<UserAlbumSearchVO> list = page.getRecords().stream().map(a -> {
            UserAlbumSearchVO vo = new UserAlbumSearchVO();
            vo.setId(a.getId());
            vo.setTitle(a.getTitle());
            vo.setCoverUrl(a.getCoverUrl());
            // Simply use primary artist id if it's there, but Album doesn't have it directly.
            // For now just return empty artist name, desktop search UI usually relies on Title.
            return vo;
        }).collect(Collectors.toList());

        return new PageResult<>(page.getCurrent(), page.getSize(), page.getTotal(), page.getPages(), list);
    }

    @Override
    public PageResult<PlaylistSearchItemVO> searchPlaylists(String keyword, Integer pageNum, Integer pageSize) {
        return playlistService.searchPublicPlaylists(keyword, pageNum, pageSize);
    }
}
