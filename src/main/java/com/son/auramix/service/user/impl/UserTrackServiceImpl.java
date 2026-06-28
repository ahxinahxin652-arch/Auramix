package com.son.auramix.service.user.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.son.auramix.common.exception.BusinessException;
import com.son.auramix.common.result.ResultCode;
import com.son.auramix.domain.entity.Album;
import com.son.auramix.domain.entity.Artist;
import com.son.auramix.domain.entity.Track;
import com.son.auramix.domain.entity.TrackArtist;
import com.son.auramix.domain.entity.TrackAudioResource;
import com.son.auramix.domain.vo.user.ArtistInfoVO;
import com.son.auramix.domain.vo.user.UserTrackDetailVO;
import com.son.auramix.mapper.AlbumMapper;
import com.son.auramix.mapper.ArtistMapper;
import com.son.auramix.mapper.TrackArtistMapper;
import com.son.auramix.mapper.TrackAudioResourceMapper;
import com.son.auramix.mapper.TrackMapper;
import com.son.auramix.service.user.UserTrackService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserTrackServiceImpl implements UserTrackService {

    private final TrackMapper trackMapper;
    private final TrackArtistMapper trackArtistMapper;
    private final ArtistMapper artistMapper;
    private final AlbumMapper albumMapper;
    private final TrackAudioResourceMapper trackAudioResourceMapper;

    @Override
    public UserTrackDetailVO getTrackDetail(Long trackId) {
        Track track = trackMapper.selectById(trackId);
        if (track == null || track.getStatus() != 0) {
            throw new BusinessException(ResultCode.NOT_FOUND, "歌曲不存在或已下架");
        }

        UserTrackDetailVO vo = new UserTrackDetailVO();
        vo.setId(track.getId());
        vo.setTitle(track.getTitle());
        vo.setDuration(track.getDuration());
        vo.setLyricsUrl(track.getLyricsUrl());

        if (track.getAlbumId() != null) {
            vo.setAlbumId(track.getAlbumId());
            Album album = albumMapper.selectById(track.getAlbumId());
            if (album != null) {
                vo.setAlbumTitle(album.getTitle());
                vo.setCoverUrl(album.getCoverUrl());
            }
        }

        List<TrackArtist> trackArtists = trackArtistMapper.selectList(
                new LambdaQueryWrapper<TrackArtist>().eq(TrackArtist::getTrackId, trackId)
                        .orderByAsc(TrackArtist::getRole));
        if (!trackArtists.isEmpty()) {
            List<ArtistInfoVO> artists = trackArtists.stream().map(ta -> {
                Artist artist = artistMapper.selectById(ta.getArtistId());
                if (artist != null) {
                    ArtistInfoVO info = new ArtistInfoVO();
                    info.setId(artist.getId());
                    info.setName(artist.getName());
                    info.setRole(ta.getRole());
                    return info;
                }
                return null;
            }).filter(Objects::nonNull).collect(Collectors.toList());
            vo.setArtists(artists);
        }

        List<TrackAudioResource> audioResources = trackAudioResourceMapper.selectList(
                new LambdaQueryWrapper<TrackAudioResource>()
                        .eq(TrackAudioResource::getTrackId, trackId)
                        .orderByDesc(TrackAudioResource::getBitrate));
        
        if (!audioResources.isEmpty()) {
            TrackAudioResource bestAudio = audioResources.get(0);
            String formatStr = "mp3";
            if (bestAudio.getFormat() != null) {
                switch (bestAudio.getFormat()) {
                    case 1: formatStr = "flac"; break;
                    case 2: formatStr = "m4a"; break;
                    case 3: formatStr = "ogg"; break;
                }
            }
            vo.setFormat(formatStr);
            vo.setSize(bestAudio.getSize());
            vo.setAudioUrl(bestAudio.getStreamUrl());
        }

        return vo;
    }
}
