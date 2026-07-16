package com.son.auramix.service.common;

import com.son.auramix.domain.cache.ArtistMetaCacheDTO;

import java.util.List;
import java.util.Map;

public interface ArtistCacheService {
    Map<Long, ArtistMetaCacheDTO> getArtistMetaBatch(List<Long> artistIds);
}
