package com.son.auramix.service.common.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.son.auramix.domain.cache.TrackMetaCacheDTO;
import com.son.auramix.domain.entity.*;
import com.son.auramix.mapper.*;
import com.son.auramix.service.common.TrackCacheService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.util.CollectionUtils;

import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class TrackCacheServiceImpl implements TrackCacheService {

    private final RedisTemplate<String, Object> redisTemplate;
    
    private final TrackMapper trackMapper;
    private final AlbumMapper albumMapper;
    private final TrackArtistMapper trackArtistMapper;
    private final GenreMapper genreMapper;
    private final TrackGenreMapper trackGenreMapper;

    private static final String TRACK_META_PREFIX = "auramix:cache:track:meta:";

    @Override
    public Map<Long, TrackMetaCacheDTO> getTrackMetaBatch(List<Long> trackIds) {
        if (CollectionUtils.isEmpty(trackIds)) {
            return Collections.emptyMap();
        }

        // Deduplicate
        List<Long> distinctIds = trackIds.stream().distinct().collect(Collectors.toList());
        
        List<String> keys = distinctIds.stream()
                .map(id -> TRACK_META_PREFIX + id)
                .collect(Collectors.toList());

        // multiGet from redis
        List<Object> cachedObjs = redisTemplate.opsForValue().multiGet(keys);
        
        Map<Long, TrackMetaCacheDTO> resultMap = new HashMap<>();
        List<Long> missedIds = new ArrayList<>();
        
        for (int i = 0; i < distinctIds.size(); i++) {
            Long trackId = distinctIds.get(i);
            Object obj = (cachedObjs != null && i < cachedObjs.size()) ? cachedObjs.get(i) : null;
            if (obj instanceof TrackMetaCacheDTO) {
                resultMap.put(trackId, (TrackMetaCacheDTO) obj);
            } else {
                missedIds.add(trackId);
            }
        }

        // fetch missed from db
        if (!CollectionUtils.isEmpty(missedIds)) {
            List<Track> dbTracks = trackMapper.selectBatchIds(missedIds);
            
            if (!CollectionUtils.isEmpty(dbTracks)) {
                // collect album ids
                Set<Long> albumIds = dbTracks.stream()
                        .map(Track::getAlbumId)
                        .filter(Objects::nonNull)
                        .collect(Collectors.toSet());
                        
                Map<Long, Album> albumMap = new HashMap<>();
                if (!CollectionUtils.isEmpty(albumIds)) {
                    List<Album> albums = albumMapper.selectBatchIds(albumIds);
                    if (!CollectionUtils.isEmpty(albums)) {
                        albumMap = albums.stream().collect(Collectors.toMap(Album::getId, a -> a));
                    }
                }
                
                // fetch track artists
                List<TrackArtist> trackArtists = trackArtistMapper.selectList(
                        new LambdaQueryWrapper<TrackArtist>().in(TrackArtist::getTrackId, missedIds)
                );
                Map<Long, List<TrackArtist>> trackArtistGroup = trackArtists.stream()
                        .collect(Collectors.groupingBy(TrackArtist::getTrackId));

                // fetch track genres
                List<TrackGenre> trackGenres = trackGenreMapper.selectList(
                        new LambdaQueryWrapper<TrackGenre>().in(TrackGenre::getTrackId, missedIds)
                );
                Map<Long, List<TrackGenre>> trackGenreGroup = trackGenres.stream()
                        .collect(Collectors.groupingBy(TrackGenre::getTrackId));
                        
                Set<Long> genreIds = trackGenres.stream()
                        .map(TrackGenre::getGenreId)
                        .collect(Collectors.toSet());
                Map<Long, Genre> genreMap;
                if (!CollectionUtils.isEmpty(genreIds)) {
                    List<Genre> genres = genreMapper.selectBatchIds(genreIds);
                    if (!CollectionUtils.isEmpty(genres)) {
                        genreMap = genres.stream().collect(Collectors.toMap(Genre::getId, g -> g));
                    } else {
                        genreMap = new HashMap<>();
                    }
                } else {
                    genreMap = new HashMap<>();
                }

                // build DTOs and set multiSetMap
                Map<String, Object> multiSetMap = new HashMap<>();
                
                for (Track track : dbTracks) {
                    TrackMetaCacheDTO dto = new TrackMetaCacheDTO();
                    dto.setTitle(track.getTitle());
                    dto.setDuration(track.getDuration());
                    dto.setMember(track.getMember());
                    
                    Album album = albumMap.get(track.getAlbumId());
                    if (album != null) {
                        dto.setAlbumId(album.getId());
                        dto.setAlbumTitle(album.getTitle());
                        dto.setCoverUrl(album.getCoverUrl());
                    }
                    
                    // set artists
                    List<TrackArtist> taList = trackArtistGroup.getOrDefault(track.getId(), Collections.emptyList());
                    List<TrackMetaCacheDTO.ArtistRelation> artistRelationList = taList.stream().map(ta -> {
                        TrackMetaCacheDTO.ArtistRelation ar = new TrackMetaCacheDTO.ArtistRelation();
                        ar.setArtistId(ta.getArtistId());
                        ar.setRole(ta.getRole());
                        return ar;
                    }).collect(Collectors.toList());
                    dto.setArtistRelations(artistRelationList);
                    
                    // set genres
                    List<TrackGenre> tgList = trackGenreGroup.getOrDefault(track.getId(), Collections.emptyList());
                    List<TrackMetaCacheDTO.GenreMeta> genreMetaList = tgList.stream().map(tg -> {
                        Genre genre = genreMap.get(tg.getGenreId());
                        if (genre != null) {
                            TrackMetaCacheDTO.GenreMeta gm = new TrackMetaCacheDTO.GenreMeta();
                            gm.setId(genre.getId());
                            gm.setName(genre.getName());
                            return gm;
                        }
                        return null;
                    }).filter(Objects::nonNull).collect(Collectors.toList());
                    dto.setGenres(genreMetaList);
                    
                    resultMap.put(track.getId(), dto);
                    multiSetMap.put(TRACK_META_PREFIX + track.getId(), dto);
                }
                
                if (!multiSetMap.isEmpty()) {
                    redisTemplate.opsForValue().multiSet(multiSetMap);
                    for (String key : multiSetMap.keySet()) {
                        long expireSeconds = java.util.concurrent.ThreadLocalRandom.current().nextInt(1530, 2071);
                        redisTemplate.expire(key, expireSeconds, java.util.concurrent.TimeUnit.SECONDS);
                    }
                }
            }
        }

        return resultMap;
    }
}
