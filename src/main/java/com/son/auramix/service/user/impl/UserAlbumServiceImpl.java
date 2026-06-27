package com.son.auramix.service.user.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.son.auramix.domain.entity.Album;
import com.son.auramix.domain.entity.Artist;
import com.son.auramix.domain.entity.Track;
import com.son.auramix.domain.entity.TrackArtist;
import com.son.auramix.domain.vo.user.UserAlbumDetailVO;
import com.son.auramix.domain.vo.user.UserTrackSearchVO;
import com.son.auramix.mapper.AlbumMapper;
import com.son.auramix.mapper.ArtistMapper;
import com.son.auramix.mapper.TrackArtistMapper;
import com.son.auramix.mapper.TrackMapper;
import com.son.auramix.service.user.UserAlbumService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserAlbumServiceImpl implements UserAlbumService {

    private final AlbumMapper albumMapper;
    private final TrackMapper trackMapper;
    private final TrackArtistMapper trackArtistMapper;
    private final ArtistMapper artistMapper;

    @Override
    public UserAlbumDetailVO getAlbumDetail(Long albumId) {
        Album album = albumMapper.selectById(albumId);
        if (album == null) {
            throw new RuntimeException("专辑不存在");
        }

        UserAlbumDetailVO vo = new UserAlbumDetailVO();
        vo.setId(album.getId());
        vo.setTitle(album.getTitle());
        vo.setCoverUrl(album.getCoverUrl());
        vo.setReleaseDate(album.getReleaseDate());
        vo.setAlbumType(album.getAlbumType());

        // 获取专辑下的所有歌曲
        List<Track> tracks = trackMapper.selectList(
                new LambdaQueryWrapper<Track>().eq(Track::getAlbumId, albumId).eq(Track::getStatus, 0)
        );

        if (tracks.isEmpty()) {
            vo.setTracks(new ArrayList<>());
            return vo;
        }

        List<Long> trackIds = tracks.stream().map(Track::getId).collect(Collectors.toList());
        List<TrackArtist> trackArtists = trackArtistMapper.selectList(
                new LambdaQueryWrapper<TrackArtist>().in(TrackArtist::getTrackId, trackIds)
        );
        List<Long> artistIds = trackArtists.stream().map(TrackArtist::getArtistId).distinct().collect(Collectors.toList());

        Map<Long, Artist> artistMap = artistIds.isEmpty() ? new HashMap<>() :
                artistMapper.selectBatchIds(artistIds).stream().collect(Collectors.toMap(Artist::getId, a -> a));

        Map<Long, List<TrackArtist>> trackArtistsByTrack = trackArtists.stream()
                .collect(Collectors.groupingBy(TrackArtist::getTrackId));

        List<UserTrackSearchVO> trackVOs = tracks.stream().map(t -> {
            UserTrackSearchVO tVo = new UserTrackSearchVO();
            tVo.setId(t.getId());
            tVo.setTitle(t.getTitle());
            tVo.setDuration(t.getDuration());
            tVo.setAlbumId(album.getId());
            tVo.setAlbumTitle(album.getTitle());
            tVo.setCoverUrl(album.getCoverUrl());

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
