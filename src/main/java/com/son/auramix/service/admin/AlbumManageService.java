package com.son.auramix.service.admin;

import com.son.auramix.common.result.PageResult;
import com.son.auramix.domain.dto.admin.AlbumDetailResponse;
import com.son.auramix.domain.dto.admin.AlbumListItemResponse;
import com.son.auramix.domain.dto.admin.AlbumQuickCreateRequest;
import com.son.auramix.domain.dto.admin.AlbumSearchResponse;
import com.son.auramix.domain.dto.admin.AlbumUpdateRequest;
import java.util.List;

public interface AlbumManageService {
    List<AlbumSearchResponse> searchAlbums(String query);
    AlbumSearchResponse quickCreate(AlbumQuickCreateRequest req);

    PageResult<AlbumListItemResponse> listAlbums(String query, Integer pageNum, Integer pageSize);
    AlbumDetailResponse getAlbumDetail(Long id);
    void updateAlbum(Long id, AlbumUpdateRequest req);
    void deleteAlbum(Long id);
}
