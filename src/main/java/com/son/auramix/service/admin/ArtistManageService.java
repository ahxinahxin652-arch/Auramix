package com.son.auramix.service.admin;

import com.son.auramix.common.result.PageResult;
import com.son.auramix.domain.dto.admin.ArtistCreateDTO;
import com.son.auramix.domain.vo.admin.ArtistDetailVO;
import com.son.auramix.domain.vo.admin.ArtistListItemVO;
import com.son.auramix.domain.vo.admin.ArtistSearchVO;
import com.son.auramix.domain.dto.admin.ArtistUpdateDTO;
import java.util.List;

public interface ArtistManageService {
    List<ArtistSearchVO> searchArtists(String query);

    PageResult<ArtistListItemVO> listArtists(String query, Integer pageNum, Integer pageSize);
    ArtistDetailVO getArtistDetail(Long id);
    void createArtist(ArtistCreateDTO req);
    void updateArtist(Long id, ArtistUpdateDTO req);
    void deleteArtist(Long id);
}
