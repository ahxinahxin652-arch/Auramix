package com.son.auramix.service.user;

import com.son.auramix.domain.vo.user.UserLibrarySyncVO;

public interface UserLibraryService {
    UserLibrarySyncVO getLibrarySyncData(Long userId);
}
