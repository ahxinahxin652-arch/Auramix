package com.son.auramix.service.admin;

import com.son.auramix.common.result.PageResult;
import com.son.auramix.domain.dto.admin.GenreCreateDTO;
import com.son.auramix.domain.dto.admin.GenreUpdateDTO;
import com.son.auramix.domain.dto.admin.TrackGenreBindDTO;
import com.son.auramix.domain.vo.admin.GenreVO;

import java.util.List;

public interface GenreManageService {
    
    // ==========================================
    // 流派基础管理
    // ==========================================
    PageResult<GenreVO> listGenres(String query, Integer pageNum, Integer pageSize);
    List<GenreVO> getAllGenres();
    void addGenre(GenreCreateDTO req);
    void updateGenre(Long id, GenreUpdateDTO req);
    void deleteGenre(Long id);
    
    // ==========================================
    // 歌曲流派管理
    // ==========================================
    List<GenreVO> getGenresByTrackId(Long trackId);
    void bindGenresToTrack(TrackGenreBindDTO req);
    void unbindGenreFromTrack(Long trackId, Long genreId);
}
