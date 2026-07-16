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
import com.son.auramix.domain.cache.ArtistMetaCacheDTO;
import com.son.auramix.service.common.TrackCacheService;
import com.son.auramix.service.common.ArtistCacheService;
import org.springframework.data.redis.core.RedisTemplate;

@Service
@RequiredArgsConstructor
public class UserAlbumServiceImpl implements UserAlbumService {
    private static final com.fasterxml.jackson.databind.ObjectMapper MAPPER = new com.fasterxml.jackson.databind.ObjectMapper().registerModule(new com.fasterxml.jackson.datatype.jsr310.JavaTimeModule()).disable(com.fasterxml.jackson.databind.SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);


    private final AlbumMapper albumMapper;
    private final TrackMapper trackMapper;
    private final TrackArtistMapper trackArtistMapper;
    private final ArtistMapper artistMapper;
    private final TrackCacheService trackCacheService;
    private final ArtistCacheService artistCacheService;
    private final RedisTemplate<String, Object> redisTemplate;
    private final org.springframework.data.redis.core.StringRedisTemplate stringRedisTemplate;

    @Override
    public UserAlbumDetailVO getAlbumDetail(Long albumId) {
        String metaKey = "auramix:cache:album:" + albumId + ":meta";
        com.son.auramix.domain.cache.AlbumMetaCacheDTO albumMeta = (com.son.auramix.domain.cache.AlbumMetaCacheDTO) redisTemplate.opsForValue().get(metaKey);
        if (albumMeta == null) {
            Album album = albumMapper.selectById(albumId);
            if (album != null) {
                albumMeta = new com.son.auramix.domain.cache.AlbumMetaCacheDTO();
                albumMeta.setTitle(album.getTitle());
                albumMeta.setCoverUrl(album.getCoverUrl());
                albumMeta.setReleaseDate(album.getReleaseDate());
                albumMeta.setAlbumType(album.getAlbumType());
                redisTemplate.opsForValue().set(metaKey, albumMeta, 15, TimeUnit.MINUTES);
            }
        }
        if (albumMeta == null) {
            throw new RuntimeException("专辑不存在");
        }

        UserAlbumDetailVO vo = new UserAlbumDetailVO();
        vo.setId(albumId);
        vo.setTitle(albumMeta.getTitle());
        vo.setCoverUrl(albumMeta.getCoverUrl());
        vo.setReleaseDate(albumMeta.getReleaseDate());
        vo.setAlbumType(albumMeta.getAlbumType());

        String relationKey = "auramix:cache:album:" + albumId + ":list";
        String trackIdsJson = stringRedisTemplate.opsForValue().get(relationKey);
        List<Long> trackIds = null;
        if (trackIdsJson != null) {
            try {
                trackIds = MAPPER.readValue(trackIdsJson, new com.fasterxml.jackson.core.type.TypeReference<List<Long>>(){});
            } catch (Exception e) {
                trackIds = null;
            }
        }
        if (trackIds == null) {
            List<Track> tracks = trackMapper.selectList(
                    new LambdaQueryWrapper<Track>().eq(Track::getAlbumId, albumId).orderByAsc(Track::getId)
            );
            trackIds = tracks.stream().map(Track::getId).collect(Collectors.toList());
            try {
                stringRedisTemplate.opsForValue().set(relationKey, MAPPER.writeValueAsString(trackIds), 15, TimeUnit.MINUTES);
            } catch (Exception e) {
                // ignore
            }
        }

        if (trackIds.isEmpty()) {
            vo.setTracks(new ArrayList<>());
            return vo;
        }

        Map<Long, TrackMetaCacheDTO> trackMetaMap = trackCacheService.getTrackMetaBatch(trackIds);
        
        List<Long> allArtistIds = trackMetaMap.values().stream()
                .filter(Objects::nonNull)
                .map(TrackMetaCacheDTO::getArtistRelations)
                .filter(Objects::nonNull)
                .flatMap(List::stream)
                .map(TrackMetaCacheDTO.ArtistRelation::getArtistId)
                .distinct()
                .collect(Collectors.toList());
                
        Map<Long, ArtistMetaCacheDTO> artistMetaMap = allArtistIds.isEmpty() ? new HashMap<>() : artistCacheService.getArtistMetaBatch(allArtistIds);

        List<UserTrackSearchVO> trackVOs = new ArrayList<>();
        for (Long tId : trackIds) {
            TrackMetaCacheDTO meta = trackMetaMap.get(tId);
            if (meta == null) continue;

            UserTrackSearchVO tVo = new UserTrackSearchVO();
            tVo.setId(tId);
            tVo.setTitle(meta.getTitle());
            tVo.setDuration(meta.getDuration());
            tVo.setAlbumId(meta.getAlbumId());
            tVo.setAlbumTitle(meta.getAlbumTitle());
            tVo.setCoverUrl(meta.getCoverUrl());

            List<ArtistInfoVO> artists = new ArrayList<>();
            if (meta.getArtistRelations() != null) {
                for (TrackMetaCacheDTO.ArtistRelation ar : meta.getArtistRelations()) {
                    ArtistMetaCacheDTO artistMeta = artistMetaMap.get(ar.getArtistId());
                    if (artistMeta != null) {
                        ArtistInfoVO info = new ArtistInfoVO();
                        info.setId(ar.getArtistId());
                        info.setName(artistMeta.getName());
                        info.setRole(ar.getRole());
                        artists.add(info);
                    }
                }
            }
            tVo.setArtists(artists);
            trackVOs.add(tVo);
        }

        vo.setTracks(trackVOs);
        return vo;
    }
}
