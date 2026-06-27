package com.son.auramix.service.user.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.son.auramix.domain.entity.Album;
import com.son.auramix.domain.entity.Artist;
import com.son.auramix.domain.entity.Track;
import com.son.auramix.domain.entity.TrackArtist;
import com.son.auramix.domain.vo.user.UserArtistDetailVO;
import com.son.auramix.domain.vo.user.UserTrackSearchVO;
import com.son.auramix.mapper.AlbumMapper;
import com.son.auramix.mapper.ArtistMapper;
import com.son.auramix.mapper.TrackArtistMapper;
import com.son.auramix.mapper.TrackMapper;
import com.son.auramix.service.user.UserArtistService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserArtistServiceImpl implements UserArtistService {

    private final ArtistMapper artistMapper;
    private final TrackArtistMapper trackArtistMapper;
    private final TrackMapper trackMapper;
    private final AlbumMapper albumMapper;

    @Override
    public UserArtistDetailVO getArtistDetail(Long artistId) {
        Artist artist = artistMapper.selectById(artistId);
        if (artist == null) {
            throw new RuntimeException("歌手不存在");
        }

        UserArtistDetailVO vo = new UserArtistDetailVO();
        vo.setId(artist.getId());
        vo.setName(artist.getName());
        vo.setCoverImg(artist.getCoverImg());
        vo.setMetadata(artist.getBio());

        // 获取歌手的歌曲ID，取前10首（按热度和时间，这里按 play_count desc, created_at desc）
        List<TrackArtist> trackArtists = trackArtistMapper.selectList(
                new LambdaQueryWrapper<TrackArtist>().eq(TrackArtist::getArtistId, artistId)
        );

        if (trackArtists.isEmpty()) {
            vo.setTracks(new ArrayList<>());
            return vo;
        }

        List<Long> allTrackIds = trackArtists.stream().map(TrackArtist::getTrackId).distinct().collect(Collectors.toList());

        // 查询这些Track，并排序
        LambdaQueryWrapper<Track> trackWrapper = new LambdaQueryWrapper<>();
        trackWrapper.in(Track::getId, allTrackIds)
                    .eq(Track::getStatus, 0)
                    .orderByDesc(Track::getPlayCount)
                    .orderByDesc(Track::getCreatedAt)
                    .last("LIMIT 10");
        
        List<Track> topTracks = trackMapper.selectList(trackWrapper);

        if (topTracks.isEmpty()) {
            vo.setTracks(new ArrayList<>());
            return vo;
        }

        List<Long> albumIds = topTracks.stream().map(Track::getAlbumId).filter(Objects::nonNull).distinct().collect(Collectors.toList());
        Map<Long, Album> albumMap = albumIds.isEmpty() ? new HashMap<>() :
                albumMapper.selectBatchIds(albumIds).stream().collect(Collectors.toMap(Album::getId, a -> a));

        List<Long> trackIds = topTracks.stream().map(Track::getId).collect(Collectors.toList());
        List<TrackArtist> topTrackArtists = trackArtistMapper.selectList(
                new LambdaQueryWrapper<TrackArtist>().in(TrackArtist::getTrackId, trackIds)
        );
        List<Long> artistIds = topTrackArtists.stream().map(TrackArtist::getArtistId).distinct().collect(Collectors.toList());
        
        Map<Long, Artist> artistMap = artistIds.isEmpty() ? new HashMap<>() :
                artistMapper.selectBatchIds(artistIds).stream().collect(Collectors.toMap(Artist::getId, a -> a));

        Map<Long, List<TrackArtist>> trackArtistsByTrack = topTrackArtists.stream()
                .collect(Collectors.groupingBy(TrackArtist::getTrackId));

        List<UserTrackSearchVO> trackVOs = topTracks.stream().map(t -> {
            UserTrackSearchVO tVo = new UserTrackSearchVO();
            tVo.setId(t.getId());
            tVo.setTitle(t.getTitle());
            tVo.setDuration(t.getDuration());
            
            Album album = albumMap.get(t.getAlbumId());
            if (album != null) {
                tVo.setAlbumId(album.getId());
                tVo.setAlbumTitle(album.getTitle());
                tVo.setCoverUrl(album.getCoverUrl());
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
            tVo.setArtistNames(aNames);
            tVo.setArtistIds(aIds);

            return tVo;
        }).collect(Collectors.toList());

        vo.setTracks(trackVOs);
        return vo;
    }
}
