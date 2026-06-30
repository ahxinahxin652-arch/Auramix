package com.son.auramix.service.admin;

import com.son.auramix.common.result.PageResult;
import com.son.auramix.domain.dto.admin.TrackCreateDTO;
import com.son.auramix.domain.vo.admin.TrackDetailVO;
import com.son.auramix.domain.vo.admin.TrackListItemVO;
import com.son.auramix.domain.dto.admin.TrackUpdateDTO;

public interface TrackService {
    PageResult<TrackListItemVO> listTracks(String query, Long albumId, Integer status, Integer pageNum, Integer pageSize);
    TrackDetailVO getTrackDetail(Long id);
    Long createTrack(TrackCreateDTO req);
    void updateTrack(Long id, TrackUpdateDTO req);
    void deleteTrack(Long id);
}
