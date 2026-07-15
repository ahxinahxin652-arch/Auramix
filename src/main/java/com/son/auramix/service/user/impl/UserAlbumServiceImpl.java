package com.son.auramix.service.user.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.son.auramix.domain.entity.Album;
import com.son.auramix.domain.entity.Artist;
import com.son.auramix.domain.entity.Track;
import com.son.auramix.domain.entity.TrackArtist;
import com.son.auramix.domain.vo.user.UserAlbumDetailVO;
import com.son.auramix.domain.vo.user.UserTrackSearchVO;
import com.son.auramix.domain.vo.user.ArtistInfoVO;
import com.son.auramix.mapper.AlbumMapper;
import com.son.auramix.mapper.ArtistMapper;
import com.son.auramix.mapper.TrackArtistMapper;
import com.son.auramix.mapper.TrackMapper;
import com.son.auramix.service.user.UserAlbumService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;
import com.son.auramix.domain.cache.TrackMetaCacheDTO;
import com.son.auramix.service.common.TrackCacheService;
import org.springframework.data.redis.core.RedisTemplate;

@Service
@RequiredArgsConstructor
public class UserAlbumServiceImpl implements UserAlbumService {

    private final AlbumMapper albumMapper;
    private final TrackMapper trackMapper;
    private final TrackArtistMapper trackArtistMapper;
    private final ArtistMapper artistMapper;
    private final TrackCacheService trackCacheService;
    private final RedisTemplate<String, Object> redisTemplate;

    @Override
    public UserAlbumDetailVO getAlbumDetail(Long albumId) {
        String metaKey = "albumMeta::" + albumId;
        Album album = (Album) redisTemplate.opsForValue().get(metaKey);
        if (album == null) {
            album = albumMapper.selectById(albumId);
            if (album != null) {
                redisTemplate.opsForValue().set(metaKey, album, 15, TimeUnit.MINUTES);
            }
        }
        if (album == null) {
            throw new RuntimeException("专辑不存在");
        }

        UserAlbumDetailVO vo = new UserAlbumDetailVO();
        vo.setId(album.getId());
        vo.setTitle(album.getTitle());
        vo.setCoverUrl(album.getCoverUrl());
        vo.setReleaseDate(album.getReleaseDate());
        vo.setAlbumType(album.getAlbumType());

        String relationKey = "albumTrackRelations::" + albumId;
        List<Long> trackIds = (List<Long>) redisTemplate.opsForValue().get(relationKey);
        if (trackIds == null) {
            List<Track> tracks = trackMapper.selectList(
                    new LambdaQueryWrapper<Track>().eq(Track::getAlbumId, albumId).orderByAsc(Track::getId)
            );
            trackIds = tracks.stream().map(Track::getId).collect(Collectors.toList());
            redisTemplate.opsForValue().set(relationKey, trackIds, 15, TimeUnit.MINUTES);
        }

        if (trackIds.isEmpty()) {
            vo.setTracks(new ArrayList<>());
            return vo;
        }

        Map<Long, TrackMetaCacheDTO> trackMetaMap = trackCacheService.getTrackMetaBatch(trackIds);
        List<UserTrackSearchVO> trackVOs = new ArrayList<>();
        for (Long tId : trackIds) {
            TrackMetaCacheDTO meta = trackMetaMap.get(tId);
            if (meta == null) continue;

            UserTrackSearchVO tVo = new UserTrackSearchVO();
            tVo.setId(meta.getId());
            tVo.setTitle(meta.getTitle());
            tVo.setDuration(meta.getDuration());
            tVo.setAlbumId(meta.getAlbumId());
            tVo.setAlbumTitle(meta.getAlbumTitle());
            tVo.setCoverUrl(meta.getCoverUrl());

            List<ArtistInfoVO> artists = new ArrayList<>();
            if (meta.getArtists() != null) {
                for (TrackMetaCacheDTO.ArtistMeta a : meta.getArtists()) {
                    ArtistInfoVO info = new ArtistInfoVO();
                    info.setId(a.getId());
                    info.setName(a.getName());
                    info.setRole(a.getRole());
                    artists.add(info);
                }
            }
            tVo.setArtists(artists);
            trackVOs.add(tVo);
        }

        vo.setTracks(trackVOs);
        return vo;
    }
}
