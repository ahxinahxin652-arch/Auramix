package com.son.auramix.service.admin.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.son.auramix.common.exception.BusinessException;
import com.son.auramix.common.result.PageResult;
import com.son.auramix.common.result.ResultCode;
import com.son.auramix.domain.vo.admin.AlbumDetailVO;
import com.son.auramix.domain.vo.admin.AlbumListItemVO;
import com.son.auramix.domain.dto.admin.AlbumQuickCreateDTO;
import com.son.auramix.domain.vo.admin.AlbumSearchVO;
import com.son.auramix.domain.dto.admin.AlbumUpdateDTO;
import com.son.auramix.domain.entity.Album;
import com.son.auramix.domain.entity.AlbumArtist;
import com.son.auramix.domain.entity.Artist;
import com.son.auramix.domain.entity.Track;
import com.son.auramix.domain.entity.TrackArtist;
import com.son.auramix.domain.entity.TrackAudioResource;
import com.son.auramix.domain.entity.TrackVideoResource;
import com.son.auramix.domain.entity.TrackGenre;
import com.son.auramix.mapper.AlbumArtistMapper;
import com.son.auramix.mapper.AlbumMapper;
import com.son.auramix.mapper.ArtistMapper;
import com.son.auramix.mapper.TrackMapper;
import com.son.auramix.mapper.TrackArtistMapper;
import com.son.auramix.mapper.TrackAudioResourceMapper;
import com.son.auramix.mapper.TrackVideoResourceMapper;
import com.son.auramix.mapper.TrackGenreMapper;
import com.son.auramix.service.admin.AlbumManageService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AlbumManageServiceImpl implements AlbumManageService {
    private final AlbumMapper albumMapper;
    private final AlbumArtistMapper albumArtistMapper;
    private final ArtistMapper artistMapper;
    private final TrackMapper trackMapper;
    private final TrackArtistMapper trackArtistMapper;
    private final TrackAudioResourceMapper trackAudioResourceMapper;
    private final TrackVideoResourceMapper trackVideoResourceMapper;
    private final TrackGenreMapper trackGenreMapper;

    @Override
    public List<AlbumSearchVO> searchAlbums(String query) {
        LambdaQueryWrapper<Album> wrapper = new LambdaQueryWrapper<>();
        if (query != null && !query.trim().isEmpty()) {
            wrapper.like(Album::getTitle, query);
        }
        wrapper.orderByDesc(Album::getId).last("LIMIT 20");
        return albumMapper.selectList(wrapper).stream().map(a -> {
            AlbumSearchVO res = new AlbumSearchVO();
            res.setId(a.getId());
            res.setTitle(a.getTitle());
            res.setAlbumType(a.getAlbumType());
            res.setCoverUrl(a.getCoverUrl());
            return res;
        }).collect(Collectors.toList());
    }

    @Override
    public AlbumSearchVO quickCreate(AlbumQuickCreateDTO req) {
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

        AlbumSearchVO res = new AlbumSearchVO();
        res.setId(album.getId());
        res.setTitle(album.getTitle());
        res.setAlbumType(album.getAlbumType());
        res.setCoverUrl(album.getCoverUrl());
        return res;
    }

    @Override
    public PageResult<AlbumListItemVO> listAlbums(String query, Integer pageNum, Integer pageSize) {
        int current = pageNum == null || pageNum < 1 ? 1 : pageNum;
        int size = pageSize == null || pageSize < 1 ? 10 : (pageSize > 100 ? 100 : pageSize);
        Page<Album> page = new Page<>(current, size);

        LambdaQueryWrapper<Album> wrapper = new LambdaQueryWrapper<>();
        if (query != null && !query.trim().isEmpty()) {
            wrapper.like(Album::getTitle, query);
        }
        wrapper.orderByDesc(Album::getId);
        albumMapper.selectPage(page, wrapper);

        List<AlbumListItemVO> list = page.getRecords().stream().map(a -> {
            AlbumListItemVO item = new AlbumListItemVO();
            item.setId(a.getId());
            item.setTitle(a.getTitle());
            item.setAlbumType(a.getAlbumType());
            item.setCoverUrl(a.getCoverUrl());
            item.setReleaseDate(a.getReleaseDate());
            item.setCreatedAt(a.getCreatedAt());
            item.setUpdatedAt(a.getUpdatedAt());
            return item;
        }).collect(Collectors.toList());

        return new PageResult<>(page.getCurrent(), page.getSize(), page.getTotal(), page.getPages(), list);
    }

    @Override
    public AlbumDetailVO getAlbumDetail(Long id) {
        Album album = albumMapper.selectById(id);
        if (album == null) {
            throw new BusinessException(ResultCode.NOT_FOUND);
        }

        AlbumDetailVO detail = new AlbumDetailVO();
        detail.setId(album.getId());
        detail.setTitle(album.getTitle());
        detail.setAlbumType(album.getAlbumType());
        detail.setCoverUrl(album.getCoverUrl());
        detail.setReleaseDate(album.getReleaseDate());
        detail.setCreatedAt(album.getCreatedAt());
        detail.setUpdatedAt(album.getUpdatedAt());

        // Load associated artists
        List<AlbumArtist> albumArtists = albumArtistMapper.selectList(
                new LambdaQueryWrapper<AlbumArtist>().eq(AlbumArtist::getAlbumId, id));
        if (!albumArtists.isEmpty()) {
            List<Long> artistIds = albumArtists.stream()
                    .map(AlbumArtist::getArtistId)
                    .distinct()
                    .collect(Collectors.toList());
            Map<Long, Artist> artistMap;
            if (!artistIds.isEmpty()) {
                List<Artist> artists = artistMapper.selectBatchIds(artistIds);
                if (artists != null) {
                    artistMap = artists.stream().collect(Collectors.toMap(Artist::getId, a -> a));
                } else {
                    artistMap = new HashMap<>();
                }
            } else {
                artistMap = new HashMap<>();
            }
            List<AlbumDetailVO.AlbumArtistDto> artistDtos = albumArtists.stream().map(aa -> {
                AlbumDetailVO.AlbumArtistDto dto = new AlbumDetailVO.AlbumArtistDto();
                dto.setArtistId(aa.getArtistId());
                Artist artist = artistMap.get(aa.getArtistId());
                if (artist != null) {
                    dto.setArtistName(artist.getName());
                }
                return dto;
            }).collect(Collectors.toList());
            detail.setArtists(artistDtos);
        }

        return detail;
    }

    @Override
    @Transactional
    public void updateAlbum(Long id, AlbumUpdateDTO req) {
        Album album = albumMapper.selectById(id);
        if (album == null) {
            throw new BusinessException(ResultCode.NOT_FOUND);
        }

        album.setTitle(req.getTitle());
        album.setAlbumType(req.getAlbumType());
        album.setCoverUrl(req.getCoverUrl());
        if (req.getReleaseDate() != null && !req.getReleaseDate().isEmpty()) {
            album.setReleaseDate(LocalDateTime.of(LocalDate.parse(req.getReleaseDate(), DateTimeFormatter.ofPattern("yyyy-MM-dd")), LocalTime.MIN));
        }
        albumMapper.updateById(album);

        // Replace artist associations if provided
        if (req.getArtistIds() != null) {
            // Validate artists exist
            if (!req.getArtistIds().isEmpty()) {
                List<Artist> artists = artistMapper.selectBatchIds(req.getArtistIds());
                if (artists == null || artists.size() < req.getArtistIds().stream().distinct().count()) {
                    throw new BusinessException(ResultCode.BAD_REQUEST, "One or more artists do not exist");
                }
            }
            albumArtistMapper.delete(new LambdaQueryWrapper<AlbumArtist>().eq(AlbumArtist::getAlbumId, id));
            for (Long artistId : req.getArtistIds()) {
                AlbumArtist aa = new AlbumArtist();
                aa.setAlbumId(id);
                aa.setArtistId(artistId);
                albumArtistMapper.insert(aa);
            }
        }
    }

    @Override
    @Transactional
    public void deleteAlbum(Long id) {
        Album album = albumMapper.selectById(id);
        if (album == null) {
            throw new BusinessException(ResultCode.NOT_FOUND);
        }

        // 查出专辑下所有歌曲 ID，级联清理
        List<Track> tracks = trackMapper.selectList(
                new LambdaQueryWrapper<Track>().eq(Track::getAlbumId, id));
        if (tracks != null && !tracks.isEmpty()) {
            List<Long> trackIds = tracks.stream().map(Track::getId).collect(Collectors.toList());
            // 歌曲-流派关联
            trackGenreMapper.delete(new LambdaQueryWrapper<TrackGenre>().in(TrackGenre::getTrackId, trackIds));
            // 歌曲-歌手关联
            trackArtistMapper.delete(new LambdaQueryWrapper<TrackArtist>().in(TrackArtist::getTrackId, trackIds));
            // 音源资源
            trackAudioResourceMapper.delete(new LambdaQueryWrapper<TrackAudioResource>().in(TrackAudioResource::getTrackId, trackIds));
            // 视频资源
            trackVideoResourceMapper.delete(new LambdaQueryWrapper<TrackVideoResource>().in(TrackVideoResource::getTrackId, trackIds));
            // 歌曲本身
            trackMapper.delete(new LambdaQueryWrapper<Track>().in(Track::getId, trackIds));
        }

        // 专辑-歌手关联
        albumArtistMapper.delete(new LambdaQueryWrapper<AlbumArtist>().eq(AlbumArtist::getAlbumId, id));
        // 专辑本身
        albumMapper.deleteById(id);
    }
}
