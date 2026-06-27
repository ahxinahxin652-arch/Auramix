package com.son.auramix.service.user;

import com.son.auramix.domain.vo.user.UserAlbumDetailVO;

public interface UserAlbumService {
    UserAlbumDetailVO getAlbumDetail(Long albumId);
}
