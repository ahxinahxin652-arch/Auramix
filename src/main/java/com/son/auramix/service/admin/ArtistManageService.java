package com.son.auramix.service.admin;

import com.son.auramix.common.result.PageResult;
import com.son.auramix.domain.dto.admin.ArtistCreateRequest;
import com.son.auramix.domain.dto.admin.ArtistDetailResponse;
import com.son.auramix.domain.dto.admin.ArtistListItemResponse;
import com.son.auramix.domain.dto.admin.ArtistSearchResponse;
import com.son.auramix.domain.dto.admin.ArtistUpdateRequest;
import java.util.List;

public interface ArtistManageService {
    List<ArtistSearchResponse> searchArtists(String query);

    PageResult<ArtistListItemResponse> listArtists(String query, Integer pageNum, Integer pageSize);
    ArtistDetailResponse getArtistDetail(Long id);
    void createArtist(ArtistCreateRequest req);
    void updateArtist(Long id, ArtistUpdateRequest req);
    void deleteArtist(Long id);
}
