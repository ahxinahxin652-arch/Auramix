package com.son.auramix.service.admin.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.son.auramix.common.exception.BusinessException;
import com.son.auramix.common.result.PageResult;
import com.son.auramix.common.result.ResultCode;
import com.son.auramix.domain.dto.admin.ArtistCreateDTO;
import com.son.auramix.domain.vo.admin.ArtistDetailVO;
import com.son.auramix.domain.vo.admin.ArtistListItemVO;
import com.son.auramix.domain.vo.admin.ArtistSearchVO;
import com.son.auramix.domain.dto.admin.ArtistUpdateDTO;
import com.son.auramix.domain.entity.AlbumArtist;
import com.son.auramix.domain.entity.Artist;
import com.son.auramix.domain.entity.ArtistFollower;
import com.son.auramix.domain.entity.TrackArtist;
import com.son.auramix.mapper.AlbumArtistMapper;
import com.son.auramix.mapper.ArtistFollowerMapper;
import com.son.auramix.mapper.ArtistMapper;
import com.son.auramix.mapper.TrackArtistMapper;
import com.son.auramix.service.admin.ArtistManageService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.CacheEvict;

@Service
@RequiredArgsConstructor
public class ArtistManageServiceImpl implements ArtistManageService {
    private final ArtistMapper artistMapper;
    private final TrackArtistMapper trackArtistMapper;
    private final AlbumArtistMapper albumArtistMapper;
    private final ArtistFollowerMapper artistFollowerMapper;

    @Override
    public List<ArtistSearchVO> searchArtists(String query) {
        LambdaQueryWrapper<Artist> wrapper = new LambdaQueryWrapper<>();
        if (query != null && !query.trim().isEmpty()) {
            wrapper.like(Artist::getName, query);
        }
        wrapper.orderByDesc(Artist::getId).last("LIMIT 20");
        return artistMapper.selectList(wrapper).stream().map(a -> {
            ArtistSearchVO res = new ArtistSearchVO();
            res.setId(a.getId());
            res.setName(a.getName());
            res.setCoverImg(a.getCoverImg());
            return res;
        }).collect(Collectors.toList());
    }

    @Override
    public PageResult<ArtistListItemVO> listArtists(String query, Integer pageNum, Integer pageSize) {
        int current = pageNum == null || pageNum < 1 ? 1 : pageNum;
        int size = pageSize == null || pageSize < 1 ? 10 : (pageSize > 100 ? 100 : pageSize);
        Page<Artist> page = new Page<>(current, size);

        LambdaQueryWrapper<Artist> wrapper = new LambdaQueryWrapper<>();
        if (query != null && !query.trim().isEmpty()) {
            wrapper.like(Artist::getName, query);
        }
        wrapper.orderByDesc(Artist::getId);
        artistMapper.selectPage(page, wrapper);

        List<ArtistListItemVO> list = page.getRecords().stream().map(a -> {
            ArtistListItemVO item = new ArtistListItemVO();
            item.setId(a.getId());
            item.setName(a.getName());
            item.setCoverImg(a.getCoverImg());
            item.setBio(a.getBio());
            item.setCreatedAt(a.getCreatedAt());
            item.setUpdatedAt(a.getUpdatedAt());
            return item;
        }).collect(Collectors.toList());

        return new PageResult<>(page.getCurrent(), page.getSize(), page.getTotal(), page.getPages(), list);
    }

    @Override
    @Cacheable(value = "artistDetail", key = "#id")
    public ArtistDetailVO getArtistDetail(Long id) {
        Artist artist = artistMapper.selectById(id);
        if (artist == null) {
            throw new BusinessException(ResultCode.NOT_FOUND);
        }

        ArtistDetailVO detail = new ArtistDetailVO();
        detail.setId(artist.getId());
        detail.setName(artist.getName());
        detail.setCoverImg(artist.getCoverImg());
        detail.setBio(artist.getBio());
        detail.setCreatedAt(artist.getCreatedAt());
        detail.setUpdatedAt(artist.getUpdatedAt());
        return detail;
    }

    @Override
    @Transactional
    public void createArtist(ArtistCreateDTO req) {
        Artist artist = new Artist();
        artist.setName(req.getName());
        artist.setCoverImg(req.getCoverImg());
        artist.setBio(req.getBio());
        artistMapper.insert(artist);
    }

    @Override
    @Transactional
    @CacheEvict(value = "artistDetail", key = "#id")
    public void updateArtist(Long id, ArtistUpdateDTO req) {
        Artist artist = artistMapper.selectById(id);
        if (artist == null) {
            throw new BusinessException(ResultCode.NOT_FOUND);
        }

        artist.setName(req.getName());
        artist.setCoverImg(req.getCoverImg());
        artist.setBio(req.getBio());
        artistMapper.updateById(artist);
    }

    @Override
    @Transactional
    @CacheEvict(value = "artistDetail", key = "#id")
    public void deleteArtist(Long id) {
        Artist artist = artistMapper.selectById(id);
        if (artist == null) {
            throw new BusinessException(ResultCode.NOT_FOUND);
        }

        // Clean up all related associations
        trackArtistMapper.delete(new LambdaQueryWrapper<TrackArtist>().eq(TrackArtist::getArtistId, id));
        albumArtistMapper.delete(new LambdaQueryWrapper<AlbumArtist>().eq(AlbumArtist::getArtistId, id));
        artistFollowerMapper.delete(new LambdaQueryWrapper<ArtistFollower>().eq(ArtistFollower::getArtistId, id));

        artistMapper.deleteById(id);
    }
}
