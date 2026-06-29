package com.son.auramix.service.admin.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.son.auramix.common.exception.BusinessException;
import com.son.auramix.common.result.PageResult;
import com.son.auramix.common.result.ResultCode;
import com.son.auramix.domain.dto.admin.GenreCreateDTO;
import com.son.auramix.domain.dto.admin.GenreUpdateDTO;
import com.son.auramix.domain.dto.admin.TrackGenreBindDTO;
import com.son.auramix.domain.entity.Genre;
import com.son.auramix.domain.entity.TrackGenre;
import com.son.auramix.domain.vo.admin.GenreVO;
import com.son.auramix.mapper.GenreMapper;
import com.son.auramix.mapper.TrackGenreMapper;
import com.son.auramix.mapper.TrackMapper;
import com.son.auramix.service.admin.GenreManageService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class GenreManageServiceImpl implements GenreManageService {

    private final GenreMapper genreMapper;
    private final TrackGenreMapper trackGenreMapper;
    private final TrackMapper trackMapper;

    @Override
    public PageResult<GenreVO> listGenres(String query, Integer pageNum, Integer pageSize) {
        int current = pageNum == null || pageNum < 1 ? 1 : pageNum;
        int size = pageSize == null || pageSize < 1 ? 10 : (pageSize > 100 ? 100 : pageSize);
        Page<Genre> page = new Page<>(current, size);

        LambdaQueryWrapper<Genre> wrapper = new LambdaQueryWrapper<>();
        if (query != null && !query.trim().isEmpty()) {
            wrapper.like(Genre::getName, query);
        }
        wrapper.orderByDesc(Genre::getId);
        genreMapper.selectPage(page, wrapper);

        List<GenreVO> list = page.getRecords().stream().map(g -> {
            GenreVO vo = new GenreVO();
            vo.setId(g.getId());
            vo.setName(g.getName());
            vo.setCreatedAt(g.getCreatedAt());
            return vo;
        }).collect(Collectors.toList());

        return new PageResult<>(page.getCurrent(), page.getSize(), page.getTotal(), page.getPages(), list);
    }

    @Override
    public List<GenreVO> getAllGenres() {
        return genreMapper.selectList(new LambdaQueryWrapper<Genre>().orderByAsc(Genre::getName))
                .stream().map(g -> {
                    GenreVO vo = new GenreVO();
                    vo.setId(g.getId());
                    vo.setName(g.getName());
                    vo.setCreatedAt(g.getCreatedAt());
                    return vo;
                }).collect(Collectors.toList());
    }

    @Override
    public void addGenre(GenreCreateDTO req) {
        // 检查是否已存在同名流派
        Long count = genreMapper.selectCount(new LambdaQueryWrapper<Genre>().eq(Genre::getName, req.getName()));
        if (count > 0) {
            throw new BusinessException(ResultCode.BAD_REQUEST, "流派名称已存在");
        }
        
        Genre genre = new Genre();
        genre.setName(req.getName());
        genre.setCreatedAt(LocalDateTime.now());
        genreMapper.insert(genre);
    }

    @Override
    public void updateGenre(Long id, GenreUpdateDTO req) {
        Genre genre = genreMapper.selectById(id);
        if (genre == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "流派不存在");
        }
        
        // 检查名称是否冲突
        Genre existing = genreMapper.selectOne(new LambdaQueryWrapper<Genre>().eq(Genre::getName, req.getName()));
        if (existing != null && !existing.getId().equals(id)) {
            throw new BusinessException(ResultCode.BAD_REQUEST, "流派名称已存在");
        }

        genre.setName(req.getName());
        genreMapper.updateById(genre);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void deleteGenre(Long id) {
        Genre genre = genreMapper.selectById(id);
        if (genre == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "流派不存在");
        }
        
        // 级联删除歌曲流派绑定关系
        trackGenreMapper.delete(new LambdaQueryWrapper<TrackGenre>().eq(TrackGenre::getGenreId, id));
        // 删除流派
        genreMapper.deleteById(id);
    }

    @Override
    public List<GenreVO> getGenresByTrackId(Long trackId) {
        List<TrackGenre> trackGenres = trackGenreMapper.selectList(
                new LambdaQueryWrapper<TrackGenre>().eq(TrackGenre::getTrackId, trackId)
        );
        if (trackGenres == null || trackGenres.isEmpty()) {
            return List.of();
        }
        
        List<Long> genreIds = trackGenres.stream().map(TrackGenre::getGenreId).collect(Collectors.toList());
        return genreMapper.selectBatchIds(genreIds).stream().map(g -> {
            GenreVO vo = new GenreVO();
            vo.setId(g.getId());
            vo.setName(g.getName());
            vo.setCreatedAt(g.getCreatedAt());
            return vo;
        }).collect(Collectors.toList());
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void bindGenresToTrack(TrackGenreBindDTO req) {
        // 检查歌曲是否存在
        if (trackMapper.selectById(req.getTrackId()) == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "歌曲不存在");
        }

        // 清除现有的绑定关系
        trackGenreMapper.delete(new LambdaQueryWrapper<TrackGenre>().eq(TrackGenre::getTrackId, req.getTrackId()));

        // 重新绑定
        if (req.getGenreIds() != null && !req.getGenreIds().isEmpty()) {
            // 验证流派是否存在
            Long count = genreMapper.selectCount(new LambdaQueryWrapper<Genre>().in(Genre::getId, req.getGenreIds()));
            if (count < req.getGenreIds().stream().distinct().count()) {
                throw new BusinessException(ResultCode.BAD_REQUEST, "存在无效的流派ID");
            }

            for (Long genreId : req.getGenreIds()) {
                TrackGenre tg = new TrackGenre();
                tg.setTrackId(req.getTrackId());
                tg.setGenreId(genreId);
                trackGenreMapper.insert(tg);
            }
        }
    }

    @Override
    public void unbindGenreFromTrack(Long trackId, Long genreId) {
        trackGenreMapper.delete(
                new LambdaQueryWrapper<TrackGenre>()
                        .eq(TrackGenre::getTrackId, trackId)
                        .eq(TrackGenre::getGenreId, genreId)
        );
    }
}
