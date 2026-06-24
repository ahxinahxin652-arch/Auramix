package com.son.auramix.service.admin;

import com.son.auramix.domain.dto.admin.AlbumQuickCreateRequest;
import com.son.auramix.domain.dto.admin.AlbumSearchResponse;
import java.util.List;

public interface AlbumManageService {
    List<AlbumSearchResponse> searchAlbums(String query);
    AlbumSearchResponse quickCreate(AlbumQuickCreateRequest req);
}
