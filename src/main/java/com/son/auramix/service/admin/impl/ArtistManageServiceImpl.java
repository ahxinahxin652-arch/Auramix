package com.son.auramix.service.admin.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.son.auramix.domain.dto.admin.ArtistSearchResponse;
import com.son.auramix.domain.entity.Artist;
import com.son.auramix.mapper.ArtistMapper;
import com.son.auramix.service.admin.ArtistManageService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ArtistManageServiceImpl implements ArtistManageService {
    private final ArtistMapper artistMapper;

    @Override
    public List<ArtistSearchResponse> searchArtists(String query) {
        LambdaQueryWrapper<Artist> wrapper = new LambdaQueryWrapper<>();
        if (query != null && !query.trim().isEmpty()) {
            wrapper.like(Artist::getName, query);
        }
        wrapper.orderByDesc(Artist::getId).last("LIMIT 20");
        return artistMapper.selectList(wrapper).stream().map(a -> {
            ArtistSearchResponse res = new ArtistSearchResponse();
            res.setId(a.getId());
            res.setName(a.getName());
            res.setCoverImg(a.getCoverImg());
            return res;
        }).collect(Collectors.toList());
    }
}
