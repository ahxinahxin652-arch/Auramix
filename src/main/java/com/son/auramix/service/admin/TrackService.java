package com.son.auramix.service.admin;

import com.son.auramix.common.result.PageResult;
import com.son.auramix.domain.dto.admin.TrackCreateRequest;
import com.son.auramix.domain.dto.admin.TrackDetailResponse;
import com.son.auramix.domain.dto.admin.TrackListItemResponse;
import com.son.auramix.domain.dto.admin.TrackUpdateRequest;

public interface TrackService {
    PageResult<TrackListItemResponse> listTracks(String query, Long albumId, Integer status, Integer pageNum, Integer pageSize);
    TrackDetailResponse getTrackDetail(Long id);
    void createTrack(TrackCreateRequest req);
    void updateTrack(Long id, TrackUpdateRequest req);
    void deleteTrack(Long id);
}
