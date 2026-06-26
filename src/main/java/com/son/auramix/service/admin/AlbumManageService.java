package com.son.auramix.service.admin;

import com.son.auramix.common.result.PageResult;
import com.son.auramix.domain.vo.admin.AlbumDetailVO;
import com.son.auramix.domain.vo.admin.AlbumListItemVO;
import com.son.auramix.domain.dto.admin.AlbumQuickCreateDTO;
import com.son.auramix.domain.vo.admin.AlbumSearchVO;
import com.son.auramix.domain.dto.admin.AlbumUpdateDTO;
import java.util.List;

public interface AlbumManageService {
    List<AlbumSearchVO> searchAlbums(String query);
    AlbumSearchVO quickCreate(AlbumQuickCreateDTO req);

    PageResult<AlbumListItemVO> listAlbums(String query, Integer pageNum, Integer pageSize);
    AlbumDetailVO getAlbumDetail(Long id);
    void updateAlbum(Long id, AlbumUpdateDTO req);
    void deleteAlbum(Long id);
}
