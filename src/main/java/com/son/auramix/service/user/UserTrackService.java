package com.son.auramix.service.user;

import com.son.auramix.domain.vo.user.UserTrackDetailVO;

public interface UserTrackService {
    UserTrackDetailVO getTrackDetail(Long trackId);
}
