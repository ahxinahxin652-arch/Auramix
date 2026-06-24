package com.son.auramix.service.admin.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.son.auramix.domain.dto.admin.AlbumQuickCreateRequest;
import com.son.auramix.domain.dto.admin.AlbumSearchResponse;
import com.son.auramix.domain.entity.Album;
import com.son.auramix.mapper.AlbumMapper;
import com.son.auramix.service.admin.AlbumManageService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AlbumManageServiceImpl implements AlbumManageService {
    private final AlbumMapper albumMapper;

    @Override
    public List<AlbumSearchResponse> searchAlbums(String query) {
        LambdaQueryWrapper<Album> wrapper = new LambdaQueryWrapper<>();
        if (query != null && !query.trim().isEmpty()) {
            wrapper.like(Album::getTitle, query);
        }
        wrapper.orderByDesc(Album::getId).last("LIMIT 20");
        return albumMapper.selectList(wrapper).stream().map(a -> {
            AlbumSearchResponse res = new AlbumSearchResponse();
            res.setId(a.getId());
            res.setTitle(a.getTitle());
            res.setAlbumType(a.getAlbumType());
            res.setCoverUrl(a.getCoverUrl());
            return res;
        }).collect(Collectors.toList());
    }

    @Override
    public AlbumSearchResponse quickCreate(AlbumQuickCreateRequest req) {
        Album album = new Album();
        album.setTitle(req.getTitle());
        album.setAlbumType(req.getAlbumType());
        album.setCoverUrl(req.getCoverUrl());
        if (req.getReleaseDate() != null && !req.getReleaseDate().isEmpty()) {
            album.setReleaseDate(LocalDateTime.of(LocalDate.parse(req.getReleaseDate(), DateTimeFormatter.ofPattern("yyyy-MM-dd")), LocalTime.MIN));
        } else {
            album.setReleaseDate(LocalDateTime.now());
        }
        albumMapper.insert(album);

        AlbumSearchResponse res = new AlbumSearchResponse();
        res.setId(album.getId());
        res.setTitle(album.getTitle());
        res.setAlbumType(album.getAlbumType());
        res.setCoverUrl(album.getCoverUrl());
        return res;
    }
}
