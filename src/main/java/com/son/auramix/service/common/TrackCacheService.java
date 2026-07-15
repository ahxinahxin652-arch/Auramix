package com.son.auramix.service.common;

import com.son.auramix.domain.cache.TrackMetaCacheDTO;

import java.util.List;
import java.util.Map;

public interface TrackCacheService {
    
    /**
     * Batch fetch track metadata from cache or DB.
     * Missed keys will be fetched from DB and set back to Redis.
     * 
     * @param trackIds list of track ids
     * @return map of track id to track metadata DTO
     */
    Map<Long, TrackMetaCacheDTO> getTrackMetaBatch(List<Long> trackIds);
}
