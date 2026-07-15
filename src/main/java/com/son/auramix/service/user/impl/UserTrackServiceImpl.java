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
import com.son.auramix.domain.entity.Genre;
import com.son.auramix.domain.entity.TrackGenre;
import com.son.auramix.domain.vo.admin.GenreVO;
import com.son.auramix.mapper.AlbumMapper;
import com.son.auramix.mapper.ArtistMapper;
import com.son.auramix.mapper.GenreMapper;
import com.son.auramix.mapper.TrackArtistMapper;
import com.son.auramix.mapper.TrackAudioResourceMapper;
import com.son.auramix.mapper.TrackGenreMapper;
import com.son.auramix.mapper.TrackMapper;
import com.son.auramix.service.user.UserTrackService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import org.springframework.cache.annotation.Cacheable;
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
    private final TrackGenreMapper trackGenreMapper;
    private final GenreMapper genreMapper;

    @Override
    @Cacheable(value = "trackDetail", key = "#trackId")
    public UserTrackDetailVO getTrackDetail(Long trackId) {
        Track track = trackMapper.selectById(trackId);
        if (track == null || track.getStatus() != 0) {
            throw new BusinessException(ResultCode.NOT_FOUND, "歌曲不存在或已下架");
        }

        UserTrackDetailVO vo = new UserTrackDetailVO();
        vo.setId(track.getId());
        vo.setTitle(track.getTitle());
        vo.setDuration(track.getDuration());
        vo.setMember(track.getMember());
        vo.setTrackNumber(track.getTrackNumber());
        vo.setDiscNumber(track.getDiscNumber());
        vo.setLyricsUrl(track.getLyricsUrl());
        vo.setCreatedAt(track.getCreatedAt());
        vo.setUpdatedAt(track.getUpdatedAt());

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

        List<TrackGenre> trackGenres = trackGenreMapper.selectList(
                new LambdaQueryWrapper<TrackGenre>().eq(TrackGenre::getTrackId, trackId));
        if (!trackGenres.isEmpty()) {
            List<GenreVO> genres = trackGenres.stream().map(tg -> {
                Genre genre = genreMapper.selectById(tg.getGenreId());
                if (genre != null) {
                    GenreVO g = new GenreVO();
                    g.setId(genre.getId());
                    g.setName(genre.getName());
                    g.setCreatedAt(genre.getCreatedAt());
                    return g;
                }
                return null;
            }).filter(Objects::nonNull).collect(Collectors.toList());
            vo.setGenres(genres);
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
