package com.son.auramix.service.user;

import com.son.auramix.domain.vo.user.UserArtistDetailVO;

public interface UserArtistService {
    UserArtistDetailVO getArtistDetail(Long artistId);
    
    void followArtist(Long artistId);
    
    void unfollowArtist(Long artistId);
}
