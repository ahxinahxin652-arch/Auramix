package com.son.auramix.service.common.impl;

import com.son.auramix.domain.cache.ArtistMetaCacheDTO;
import com.son.auramix.domain.entity.Artist;
import com.son.auramix.mapper.ArtistMapper;
import com.son.auramix.service.common.ArtistCacheService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.util.CollectionUtils;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ThreadLocalRandom;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ArtistCacheServiceImpl implements ArtistCacheService {

    private final RedisTemplate<String, Object> redisTemplate;
    private final ArtistMapper artistMapper;

    private static final String ARTIST_META_KEY_PREFIX = "auramix:cache:artist:meta:";

    @Override
    public Map<Long, ArtistMetaCacheDTO> getArtistMetaBatch(List<Long> artistIds) {
        if (CollectionUtils.isEmpty(artistIds)) {
            return new HashMap<>();
        }

        List<String> keys = artistIds.stream()
                .map(id -> ARTIST_META_KEY_PREFIX + id)
                .collect(Collectors.toList());

        List<Object> cachedValues = redisTemplate.opsForValue().multiGet(keys);
        
        Map<Long, ArtistMetaCacheDTO> resultMap = new HashMap<>();
        List<Long> missingIds = new ArrayList<>();

        for (int i = 0; i < artistIds.size(); i++) {
            Long artistId = artistIds.get(i);
            Object cachedValue = cachedValues != null ? cachedValues.get(i) : null;
            if (cachedValue != null) {
                // Assuming standard JSON or JDK serialization properly deserializes into the DTO
                resultMap.put(artistId, (ArtistMetaCacheDTO) cachedValue);
            } else {
                missingIds.add(artistId);
            }
        }

        if (!missingIds.isEmpty()) {
            List<Artist> artists = artistMapper.selectBatchIds(missingIds);
            if (!CollectionUtils.isEmpty(artists)) {
                Map<String, Object> newCacheEntries = new HashMap<>();
                for (Artist artist : artists) {
                    ArtistMetaCacheDTO dto = new ArtistMetaCacheDTO();
                    dto.setName(artist.getName());
                    
                    resultMap.put(artist.getId(), dto);
                    newCacheEntries.put(ARTIST_META_KEY_PREFIX + artist.getId(), dto);
                }
                
                if (!newCacheEntries.isEmpty()) {
                    redisTemplate.opsForValue().multiSet(newCacheEntries);
                    for (String key : newCacheEntries.keySet()) {
                        long expireTime = ThreadLocalRandom.current().nextInt(3060, 4141);
                        redisTemplate.expire(key, expireTime, TimeUnit.SECONDS);
                    }
                }
            }
        }

        return resultMap;
    }
}
