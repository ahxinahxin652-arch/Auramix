package com.son.auramix.service.admin.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.son.auramix.common.result.PageResult;
import com.son.auramix.domain.dto.admin.*;
import com.son.auramix.domain.entity.*;
import com.son.auramix.mapper.*;
import com.son.auramix.service.admin.TrackService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.son.auramix.common.exception.BusinessException;
import com.son.auramix.common.result.ResultCode;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TrackServiceImpl implements TrackService {

    private final TrackMapper trackMapper;
    private final AlbumMapper albumMapper;
    private final ArtistMapper artistMapper;
    private final TrackArtistMapper trackArtistMapper;
    private final TrackAudioResourceMapper audioMapper;
    private final TrackVideoResourceMapper videoMapper;
    private final TrackGenreMapper trackGenreMapper;

    @Override
    public PageResult<TrackListItemResponse> listTracks(String query, Long albumId, Integer status, Integer pageNum, Integer pageSize) {
        Page<Track> page = new Page<>(pageNum, pageSize);
        LambdaQueryWrapper<Track> wrapper = new LambdaQueryWrapper<>();
        if (query != null && !query.trim().isEmpty()) {
            wrapper.like(Track::getTitle, query);
        }
        if (albumId != null) {
            wrapper.eq(Track::getAlbumId, albumId);
        }
        if (status != null) {
            wrapper.eq(Track::getStatus, status);
        }
        wrapper.orderByDesc(Track::getId);
        trackMapper.selectPage(page, wrapper);

        List<Track> records = page.getRecords();
        if (records == null || records.isEmpty()) {
            return new PageResult<>(page.getCurrent(), page.getSize(), page.getTotal(), page.getPages(), new ArrayList<>());
        }

        // Extract albumIds and query in batch
        List<Long> albumIds = records.stream()
                .map(Track::getAlbumId)
                .filter(Objects::nonNull)
                .distinct()
                .collect(Collectors.toList());
        Map<Long, Album> albumMap = new HashMap<>();
        if (!albumIds.isEmpty()) {
            List<Album> albums = albumMapper.selectBatchIds(albumIds);
            if (albums != null) {
                albumMap = albums.stream().collect(Collectors.toMap(Album::getId, a -> a));
            }
        }

        // Extract trackIds
        List<Long> trackIds = records.stream().map(Track::getId).collect(Collectors.toList());

        // Batch query TrackArtist records and group in memory
        List<TrackArtist> trackArtists = new ArrayList<>();
        if (!trackIds.isEmpty()) {
            trackArtists = trackArtistMapper.selectList(new LambdaQueryWrapper<TrackArtist>()
                    .in(TrackArtist::getTrackId, trackIds));
        }

        List<Long> artistIds = trackArtists.stream()
                .map(TrackArtist::getArtistId)
                .filter(Objects::nonNull)
                .distinct()
                .collect(Collectors.toList());
        Map<Long, Artist> artistMap = new HashMap<>();
        if (!artistIds.isEmpty()) {
            List<Artist> artists = artistMapper.selectBatchIds(artistIds);
            if (artists != null) {
                artistMap = artists.stream().collect(Collectors.toMap(Artist::getId, a -> a));
            }
        }

        Map<Long, List<TrackArtistDto>> trackArtistsMap = new HashMap<>();
        for (TrackArtist ta : trackArtists) {
            TrackArtistDto dto = new TrackArtistDto();
            dto.setArtistId(ta.getArtistId());
            dto.setRole(ta.getRole());
            Artist artist = artistMap.get(ta.getArtistId());
            if (artist != null) {
                dto.setArtistName(artist.getName());
            }
            trackArtistsMap.computeIfAbsent(ta.getTrackId(), k -> new ArrayList<>()).add(dto);
        }

        // Batch check audio/video resource presence
        Set<Long> audioTrackIds = new HashSet<>();
        if (!trackIds.isEmpty()) {
            List<TrackAudioResource> audioList = audioMapper.selectList(new LambdaQueryWrapper<TrackAudioResource>()
                    .select(TrackAudioResource::getTrackId)
                    .in(TrackAudioResource::getTrackId, trackIds));
            if (audioList != null) {
                audioTrackIds = audioList.stream().map(TrackAudioResource::getTrackId).collect(Collectors.toSet());
            }
        }

        Set<Long> videoTrackIds = new HashSet<>();
        if (!trackIds.isEmpty()) {
            List<TrackVideoResource> videoList = videoMapper.selectList(new LambdaQueryWrapper<TrackVideoResource>()
                    .select(TrackVideoResource::getTrackId)
                    .in(TrackVideoResource::getTrackId, trackIds));
            if (videoList != null) {
                videoTrackIds = videoList.stream().map(TrackVideoResource::getTrackId).collect(Collectors.toSet());
            }
        }

        final Map<Long, Album> finalAlbumMap = albumMap;
        final Map<Long, List<TrackArtistDto>> finalTrackArtistsMap = trackArtistsMap;
        final Set<Long> finalAudioTrackIds = audioTrackIds;
        final Set<Long> finalVideoTrackIds = videoTrackIds;

        List<TrackListItemResponse> list = records.stream().map(t -> {
            TrackListItemResponse item = new TrackListItemResponse();
            item.setId(t.getId());
            item.setTitle(t.getTitle());
            item.setStatus(t.getStatus());
            item.setTrackNumber(t.getTrackNumber());
            item.setDiscNumber(t.getDiscNumber());
            item.setDuration(t.getDuration());
            item.setLikedCount(t.getLikedCount());
            item.setPlayCount(t.getPlayCount());
            item.setCreatedAt(t.getCreatedAt());

            Album album = finalAlbumMap.get(t.getAlbumId());
            if (album != null) {
                item.setAlbumId(album.getId());
                item.setAlbumTitle(album.getTitle());
                item.setAlbumCover(album.getCoverUrl());
            }

            // Artists
            List<TrackArtistDto> artists = finalTrackArtistsMap.getOrDefault(t.getId(), new ArrayList<>());
            item.setArtists(artists);

            // Resource checks
            item.setHasAudio(finalAudioTrackIds.contains(t.getId()));
            item.setHasVideo(finalVideoTrackIds.contains(t.getId()));

            return item;
        }).collect(Collectors.toList());

        return new PageResult<>(page.getCurrent(), page.getSize(), page.getTotal(), page.getPages(), list);
    }

    @Override
    public TrackDetailResponse getTrackDetail(Long id) {
        Track t = trackMapper.selectById(id);
        if (t == null) return null;

        TrackDetailResponse detail = new TrackDetailResponse();
        detail.setId(t.getId());
        detail.setTitle(t.getTitle());
        detail.setAlbumId(t.getAlbumId());
        detail.setTrackNumber(t.getTrackNumber());
        detail.setDiscNumber(t.getDiscNumber());
        detail.setStatus(t.getStatus());
        detail.setLyricsUrl(t.getLyricsUrl());
        detail.setDuration(t.getDuration());
        detail.setLikedCount(t.getLikedCount());
        detail.setPlayCount(t.getPlayCount());

        Album album = albumMapper.selectById(t.getAlbumId());
        if (album != null) {
            detail.setAlbumTitle(album.getTitle());
        }

        // Artists
        LambdaQueryWrapper<TrackArtist> taWrapper = new LambdaQueryWrapper<TrackArtist>().eq(TrackArtist::getTrackId, t.getId());
        List<TrackArtist> tas = trackArtistMapper.selectList(taWrapper);
        detail.setArtists(tas.stream().map(ta -> {
            TrackArtistDto dto = new TrackArtistDto();
            dto.setArtistId(ta.getArtistId());
            dto.setRole(ta.getRole());
            Artist artist = artistMapper.selectById(ta.getArtistId());
            if (artist != null) {
                dto.setArtistName(artist.getName());
            }
            return dto;
        }).collect(Collectors.toList()));

        // Audio
        LambdaQueryWrapper<TrackAudioResource> audioWrapper = new LambdaQueryWrapper<TrackAudioResource>().eq(TrackAudioResource::getTrackId, t.getId());
        detail.setAudioResources(audioMapper.selectList(audioWrapper).stream().map(a -> {
            TrackAudioResourceDto dto = new TrackAudioResourceDto();
            dto.setQuality(a.getQuality());
            dto.setFormat(a.getFormat());
            dto.setBitrate(a.getBitrate());
            dto.setStreamUrl(a.getStreamUrl());
            dto.setSize(a.getSize());
            return dto;
        }).collect(Collectors.toList()));

        // Video
        LambdaQueryWrapper<TrackVideoResource> videoWrapper = new LambdaQueryWrapper<TrackVideoResource>().eq(TrackVideoResource::getTrackId, t.getId());
        detail.setVideoResources(videoMapper.selectList(videoWrapper).stream().map(v -> {
            TrackVideoResourceDto dto = new TrackVideoResourceDto();
            dto.setQuality(v.getQuality());
            dto.setResolution(v.getResolution());
            dto.setFps(v.getFps());
            dto.setFormat(v.getFormat());
            dto.setBitrate(v.getBitrate());
            dto.setStreamUrl(v.getStreamUrl());
            dto.setSize(v.getSize());
            return dto;
        }).collect(Collectors.toList()));

        return detail;
    }

    @Override
    @Transactional
    public void createTrack(TrackCreateRequest req) {
        // Validation: albumId exists
        Album album = albumMapper.selectById(req.getAlbumId());
        if (album == null) {
            throw new BusinessException(ResultCode.BAD_REQUEST, "Associated album does not exist");
        }

        // Validation: artistIds exist
        if (req.getArtists() != null && !req.getArtists().isEmpty()) {
            List<Long> artistIds = req.getArtists().stream().map(TrackArtistDto::getArtistId).collect(Collectors.toList());
            List<Artist> artists = artistMapper.selectBatchIds(artistIds);
            if (artists.size() < artistIds.stream().distinct().count()) {
                throw new BusinessException(ResultCode.BAD_REQUEST, "One or more artists do not exist");
            }
        }

        // Validation: trackNumber uniqueness
        Long count = trackMapper.selectCount(new LambdaQueryWrapper<Track>()
                .eq(Track::getAlbumId, req.getAlbumId())
                .eq(Track::getDiscNumber, req.getDiscNumber() != null ? req.getDiscNumber() : 1)
                .eq(Track::getTrackNumber, req.getTrackNumber())
        );
        if (count > 0) {
            throw new BusinessException(ResultCode.BAD_REQUEST, "Track number already exists in this album/disc");
        }

        Track t = new Track();
        t.setTitle(req.getTitle());
        t.setAlbumId(req.getAlbumId());
        t.setTrackNumber(req.getTrackNumber());
        t.setDiscNumber(req.getDiscNumber() != null ? req.getDiscNumber() : 1);
        t.setStatus(req.getStatus() != null ? req.getStatus() : 0);
        t.setLyricsUrl(req.getLyricsUrl());
        t.setDuration(req.getDuration() != null ? req.getDuration() : 0);
        t.setPlayCount(0L);
        t.setLikedCount(0);
        trackMapper.insert(t);

        saveRelations(t.getId(), req.getArtists(), req.getAudioResources(), req.getVideoResources());
    }

    @Override
    @Transactional
    public void updateTrack(Long id, TrackUpdateRequest req) {
        Track t = trackMapper.selectById(id);
        if (t == null) {
            throw new BusinessException(ResultCode.NOT_FOUND);
        }

        // Validation: albumId exists
        Album album = albumMapper.selectById(req.getAlbumId());
        if (album == null) {
            throw new BusinessException(ResultCode.BAD_REQUEST, "Associated album does not exist");
        }

        // Validation: artistIds exist
        if (req.getArtists() != null && !req.getArtists().isEmpty()) {
            List<Long> artistIds = req.getArtists().stream().map(TrackArtistDto::getArtistId).collect(Collectors.toList());
            List<Artist> artists = artistMapper.selectBatchIds(artistIds);
            if (artists.size() < artistIds.stream().distinct().count()) {
                throw new BusinessException(ResultCode.BAD_REQUEST, "One or more artists do not exist");
            }
        }

        // Validation: trackNumber uniqueness
        Integer targetDisc = req.getDiscNumber() != null ? req.getDiscNumber() : t.getDiscNumber();
        Long count = trackMapper.selectCount(new LambdaQueryWrapper<Track>()
                .eq(Track::getAlbumId, req.getAlbumId())
                .eq(Track::getDiscNumber, targetDisc)
                .eq(Track::getTrackNumber, req.getTrackNumber())
                .ne(Track::getId, id)
        );
        if (count > 0) {
            throw new BusinessException(ResultCode.BAD_REQUEST, "Track number already exists in this album/disc");
        }

        t.setTitle(req.getTitle());
        t.setAlbumId(req.getAlbumId());
        t.setTrackNumber(req.getTrackNumber());
        t.setDiscNumber(req.getDiscNumber() != null ? req.getDiscNumber() : t.getDiscNumber());
        t.setStatus(req.getStatus() != null ? req.getStatus() : t.getStatus());
        t.setLyricsUrl(req.getLyricsUrl());
        t.setDuration(req.getDuration() != null ? req.getDuration() : t.getDuration());
        trackMapper.updateById(t);

        // Delete and recreate relations conditionally to prevent silent data loss
        if (req.getArtists() != null) {
            trackArtistMapper.delete(new LambdaQueryWrapper<TrackArtist>().eq(TrackArtist::getTrackId, id));
            saveRelations(id, req.getArtists(), null, null);
        }
        if (req.getAudioResources() != null) {
            audioMapper.delete(new LambdaQueryWrapper<TrackAudioResource>().eq(TrackAudioResource::getTrackId, id));
            saveRelations(id, null, req.getAudioResources(), null);
        }
        if (req.getVideoResources() != null) {
            videoMapper.delete(new LambdaQueryWrapper<TrackVideoResource>().eq(TrackVideoResource::getTrackId, id));
            saveRelations(id, null, null, req.getVideoResources());
        }
    }

    @Override
    @Transactional
    public void deleteTrack(Long id) {
        trackMapper.deleteById(id);
        trackArtistMapper.delete(new LambdaQueryWrapper<TrackArtist>().eq(TrackArtist::getTrackId, id));
        audioMapper.delete(new LambdaQueryWrapper<TrackAudioResource>().eq(TrackAudioResource::getTrackId, id));
        videoMapper.delete(new LambdaQueryWrapper<TrackVideoResource>().eq(TrackVideoResource::getTrackId, id));
        trackGenreMapper.delete(new LambdaQueryWrapper<TrackGenre>().eq(TrackGenre::getTrackId, id));
    }

    private void saveRelations(Long trackId, List<TrackArtistDto> artists, List<TrackAudioResourceDto> audios, List<TrackVideoResourceDto> videos) {
        if (artists != null) {
            for (TrackArtistDto artistDto : artists) {
                TrackArtist ta = new TrackArtist();
                ta.setTrackId(trackId);
                ta.setArtistId(artistDto.getArtistId());
                ta.setRole(artistDto.getRole());
                trackArtistMapper.insert(ta);
            }
        }
        if (audios != null) {
            for (TrackAudioResourceDto audioDto : audios) {
                TrackAudioResource r = new TrackAudioResource();
                r.setTrackId(trackId);
                r.setQuality(audioDto.getQuality());
                r.setFormat(audioDto.getFormat());
                r.setBitrate(audioDto.getBitrate());
                r.setStreamUrl(audioDto.getStreamUrl());
                r.setSize(audioDto.getSize());
                audioMapper.insert(r);
            }
        }
        if (videos != null) {
            for (TrackVideoResourceDto videoDto : videos) {
                TrackVideoResource v = new TrackVideoResource();
                v.setTrackId(trackId);
                v.setQuality(videoDto.getQuality());
                v.setResolution(videoDto.getResolution());
                v.setFps(videoDto.getFps());
                v.setFormat(videoDto.getFormat());
                v.setBitrate(videoDto.getBitrate());
                v.setStreamUrl(videoDto.getStreamUrl());
                v.setSize(videoDto.getSize());
                videoMapper.insert(v);
            }
        }
    }
}
