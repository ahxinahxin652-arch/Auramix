package com.son.auramix.service.user;

import com.son.auramix.domain.vo.user.UserArtistDetailVO;

import com.son.auramix.common.result.PageResult;
import com.son.auramix.domain.vo.user.UserArtistSyncVO;

public interface UserArtistService {
    PageResult<UserArtistSyncVO> listFollowed(Integer pageNum, Integer pageSize);
    UserArtistDetailVO getArtistDetail(Long artistId);
    
    void followArtist(Long artistId);
    
    void unfollowArtist(Long artistId);
}
