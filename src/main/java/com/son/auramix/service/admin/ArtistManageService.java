package com.son.auramix.service.admin;

import com.son.auramix.domain.dto.admin.ArtistSearchResponse;
import java.util.List;

public interface ArtistManageService {
    List<ArtistSearchResponse> searchArtists(String query);
}
