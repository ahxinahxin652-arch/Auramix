package com.son.auramix.service.user.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.son.auramix.common.exception.BusinessException;
import com.son.auramix.common.result.PageResult;
import com.son.auramix.common.result.ResultCode;
import com.son.auramix.domain.cache.ArtistMetaCacheDTO;
import com.son.auramix.domain.cache.TrackMetaCacheDTO;
import com.son.auramix.domain.cache.PlaylistMetaCacheDTO;
import com.son.auramix.domain.cache.PlaylistTrackRelationDTO;
import com.son.auramix.domain.dto.user.PlaylistCreateDTO;
import com.son.auramix.domain.dto.user.PlaylistTracksDTO;
import com.son.auramix.domain.dto.user.PlaylistUpdateDTO;
import com.son.auramix.domain.entity.*;
import com.son.auramix.domain.vo.user.PlaylistDetailVO;
import com.son.auramix.domain.vo.user.PlaylistSearchItemVO;
import com.son.auramix.domain.vo.user.PlaylistTrackItemVO;
import com.son.auramix.domain.vo.user.PlaylistVO;
import com.son.auramix.mapper.*;
import com.son.auramix.security.user.UserPrincipal;
import com.son.auramix.service.common.ArtistCacheService;
import com.son.auramix.service.common.TrackCacheService;
import com.son.auramix.service.oss.OssService;
import com.son.auramix.service.oss.OssUploadResult;
import com.son.auramix.service.user.PlaylistService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.*;
import java.util.stream.Collectors;
import java.util.concurrent.TimeUnit;

import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.StringRedisTemplate;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.core.type.TypeReference;

/**
 * 用户歌单服务实现
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class PlaylistServiceImpl implements PlaylistService {

    private final PlaylistMapper playlistMapper;
    private final PlaylistTrackMapper playlistTrackMapper;
    private final PlaylistFollowerMapper playlistFollowerMapper;
    private final TrackMapper trackMapper;
    private final AlbumMapper albumMapper;
    private final TrackArtistMapper trackArtistMapper;
    private final ArtistMapper artistMapper;
    private final UserMapper userMapper;
    private final TrackGenreMapper trackGenreMapper;
    private final GenreMapper genreMapper;
    private final TrackCacheService trackCacheService;
    private final ArtistCacheService artistCacheService;
    private final RedisTemplate<String, Object> redisTemplate;
    private final StringRedisTemplate stringRedisTemplate;

    private static final ObjectMapper MAPPER = new ObjectMapper()
            .registerModule(new JavaTimeModule())
            .disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);

    /** OSS 服务（当 OSS 未配置时可能为 null）*/
    @Autowired(required = false)
    private OssService ossService;

    // ============================ 已有方法 ============================

    /**
     * 从 SecurityContextHolder 获取当前登录用户 ID
     */
    private Long getCurrentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof UserPrincipal principal) {
            return principal.getUserId();
        }
        throw new BusinessException(ResultCode.UNAUTHORIZED);
    }

    /**
     * 从 SecurityContextHolder 获取当前登录用户 ID，未登录返回 null
     */
    private Long getCurrentUserIdOrNull() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof UserPrincipal principal) {
            return principal.getUserId();
        }
        return null;
    }

    @Override
    public PlaylistVO createPlaylist(PlaylistCreateDTO req) {
        Long ownerId = getCurrentUserId();
        Playlist playlist = new Playlist();
        playlist.setOwnerId(ownerId);
        playlist.setName(req.getName());
        playlist.setDescription(req.getDescription());
        playlist.setCoverUrl(req.getCoverUrl());
        playlist.setIsPublic(req.getIsPublic() != null ? req.getIsPublic() : Boolean.FALSE);
        playlistMapper.insert(playlist);

        return toResponse(playlist);
    }

    @Override
    @Transactional
    public void deletePlaylist(Long playlistId) {
        Long ownerId = getCurrentUserId();
        Playlist playlist = getOwnedPlaylist(ownerId, playlistId);

        // 级联删除歌单-歌曲关联和关注记录
        playlistTrackMapper.delete(
                new LambdaQueryWrapper<PlaylistTrack>().eq(PlaylistTrack::getPlaylistId, playlistId));
        playlistFollowerMapper.delete(
                new LambdaQueryWrapper<PlaylistFollower>().eq(PlaylistFollower::getPlaylistId, playlistId));

        playlistMapper.deleteById(playlist.getId());

        redisTemplate.delete("auramix:cache:playlist:" + playlistId + ":meta");
        stringRedisTemplate.delete("auramix:cache:playlist:" + playlistId + ":list");

        log.info("[PlaylistService] 删除歌单 playlistId={}, ownerId={}", playlistId, ownerId);
    }

    @Override
    @Transactional
    public void addTracks(Long playlistId, PlaylistTracksDTO req) {
        Long ownerId = getCurrentUserId();
        getOwnedPlaylist(ownerId, playlistId);

        List<Long> trackIds = req.getTrackIds();

        List<PlaylistTrack> existing = playlistTrackMapper.selectList(
                new LambdaQueryWrapper<PlaylistTrack>()
                        .eq(PlaylistTrack::getPlaylistId, playlistId)
                        .in(PlaylistTrack::getTrackId, trackIds));
        List<Long> existingTrackIds = existing.stream()
                .map(PlaylistTrack::getTrackId)
                .collect(Collectors.toList());

        Integer maxSort = playlistTrackMapper.selectList(
                new LambdaQueryWrapper<PlaylistTrack>()
                        .eq(PlaylistTrack::getPlaylistId, playlistId))
                .stream()
                .map(PlaylistTrack::getSortOrder)
                .max(Integer::compareTo)
                .orElse(0);

        List<Long> toAdd = trackIds.stream()
                .filter(tid -> !existingTrackIds.contains(tid))
                .distinct()
                .collect(Collectors.toList());

        int sort = maxSort == null ? 0 : maxSort + 1;
        for (Long trackId : toAdd) {
            PlaylistTrack pt = new PlaylistTrack();
            pt.setPlaylistId(playlistId);
            pt.setTrackId(trackId);
            pt.setSortOrder(sort++);
            playlistTrackMapper.insert(pt);
        }

        stringRedisTemplate.delete("auramix:cache:playlist:" + playlistId + ":list");

        log.info("[PlaylistService] 歌单添加歌曲 playlistId={}, added={}, skipped={}",
                playlistId, toAdd.size(), trackIds.size() - toAdd.size());
    }

    @Override
    @Transactional
    public void removeTracks(Long playlistId, PlaylistTracksDTO req) {
        Long ownerId = getCurrentUserId();
        getOwnedPlaylist(ownerId, playlistId);

        int deleted = playlistTrackMapper.delete(
                new LambdaQueryWrapper<PlaylistTrack>()
                        .eq(PlaylistTrack::getPlaylistId, playlistId)
                        .in(PlaylistTrack::getTrackId, req.getTrackIds()));

        stringRedisTemplate.delete("auramix:cache:playlist:" + playlistId + ":list");

        log.info("[PlaylistService] 歌单移除歌曲 playlistId={}, deleted={}", playlistId, deleted);
    }

    // ============================ 新增方法 ============================

    @Override
    public void updatePlaylist(Long playlistId, PlaylistUpdateDTO req) {
        Long ownerId = getCurrentUserId();
        Playlist playlist = getOwnedPlaylist(ownerId, playlistId);

        if (req.getName() != null) {
            playlist.setName(req.getName());
        }
        if (req.getDescription() != null) {
            playlist.setDescription(req.getDescription());
        }
        if (req.getCoverUrl() != null) {
            playlist.setCoverUrl(req.getCoverUrl());
        }
        if (req.getIsPublic() != null) {
            playlist.setIsPublic(req.getIsPublic());
        }

        playlistMapper.updateById(playlist);
        
        redisTemplate.delete("auramix:cache:playlist:" + playlistId + ":meta");
        
        log.info("[PlaylistService] 更新歌单 playlistId={}, ownerId={}", playlistId, ownerId);
    }

    @Override
    @Transactional
    public PlaylistVO updatePlaylistWithCover(Long playlistId, PlaylistUpdateDTO req, MultipartFile cover) {
        Long ownerId = getCurrentUserId();
        Playlist playlist = getOwnedPlaylist(ownerId, playlistId);

        // 1. 更新基本信息
        if (req.getName() != null) {
            playlist.setName(req.getName());
        }
        if (req.getDescription() != null) {
            playlist.setDescription(req.getDescription());
        }
        if (req.getIsPublic() != null) {
            playlist.setIsPublic(req.getIsPublic());
        }

        // 2. 处理封面
        if (Boolean.TRUE.equals(req.getClearCover())) {
            playlist.setCoverUrl(null);
        } else if (cover != null && !cover.isEmpty()) {
            if (ossService == null) {
                throw new BusinessException(ResultCode.INTERNAL_ERROR, "OSS 服务未配置，无法上传封面");
            }
            try {
                OssUploadResult ossResult = ossService.upload(
                        cover.getBytes(), cover.getOriginalFilename(), "image");
                playlist.setCoverUrl(ossResult.getUrl());
                log.info("[PlaylistService] 封面上传成功 playlistId={}, url={}", playlistId, ossResult.getUrl());
            } catch (IOException e) {
                log.error("[PlaylistService] 封面上传失败 playlistId={}", playlistId, e);
                throw new BusinessException(ResultCode.INTERNAL_ERROR, "封面上传失败: " + e.getMessage());
            }
        } else if (req.getCoverUrl() != null) {
            // 如果通过 coverUrl 字段直接设置
            playlist.setCoverUrl(req.getCoverUrl());
        }

        playlistMapper.updateById(playlist);
        
        redisTemplate.delete("auramix:cache:playlist:" + playlistId + ":meta");
        
        log.info("[PlaylistService] 保存歌单(含封面) playlistId={}, ownerId={}", playlistId, ownerId);

        return toResponse(playlist);
    }

    @Override
    public PageResult<PlaylistVO> listMyPlaylists(Integer pageNum, Integer pageSize) {
        Long ownerId = getCurrentUserId();
        int current = pageNum == null || pageNum < 1 ? 1 : pageNum;
        int size = pageSize == null || pageSize < 1 ? 10 : (pageSize > 100 ? 100 : pageSize);

        Page<Playlist> page = new Page<>(current, size);
        LambdaQueryWrapper<Playlist> wrapper = new LambdaQueryWrapper<Playlist>()
                .eq(Playlist::getOwnerId, ownerId)
                .orderByDesc(Playlist::getCreatedAt);
        playlistMapper.selectPage(page, wrapper);

        List<PlaylistVO> list = page.getRecords().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());

        return new PageResult<>(page.getCurrent(), page.getSize(), page.getTotal(), page.getPages(), list);
    }

    @Override
    public PageResult<PlaylistSearchItemVO> searchPublicPlaylists(String keyword, Integer pageNum, Integer pageSize) {
        int current = pageNum == null || pageNum < 1 ? 1 : pageNum;
        int size = pageSize == null || pageSize < 1 ? 10 : (pageSize > 100 ? 100 : pageSize);

        Page<Playlist> page = new Page<>(current, size);
        LambdaQueryWrapper<Playlist> wrapper = new LambdaQueryWrapper<Playlist>()
                .eq(Playlist::getIsPublic, true)
                .orderByDesc(Playlist::getCreatedAt);

        if (keyword != null && !keyword.trim().isEmpty()) {
            String kw = keyword.trim();
            wrapper.and(w -> w.like(Playlist::getName, kw)
                    .or().like(Playlist::getDescription, kw));
        }

        playlistMapper.selectPage(page, wrapper);

        if (page.getRecords() == null || page.getRecords().isEmpty()) {
            return new PageResult<>(page.getCurrent(), page.getSize(), page.getTotal(), page.getPages(), new ArrayList<>());
        }

        // 批量查询 ownerName、trackCount、followerCount
        List<Playlist> playlists = page.getRecords();
        List<Long> playlistIds = playlists.stream().map(Playlist::getId).collect(Collectors.toList());
        List<Long> ownerIds = playlists.stream().map(Playlist::getOwnerId).distinct().collect(Collectors.toList());

        Map<Long, String> ownerNameMap = batchQueryOwnerNames(ownerIds);
        Map<Long, Integer> trackCountMap = batchQueryTrackCounts(playlistIds);
        Map<Long, Integer> followerCountMap = batchQueryFollowerCounts(playlistIds);

        List<PlaylistSearchItemVO> list = playlists.stream().map(p -> {
            PlaylistSearchItemVO vo = new PlaylistSearchItemVO();
            vo.setId(p.getId());
            vo.setName(p.getName());
            vo.setDescription(p.getDescription());
            vo.setCoverUrl(p.getCoverUrl());
            vo.setOwnerName(ownerNameMap.get(p.getOwnerId()));
            vo.setTrackCount(trackCountMap.getOrDefault(p.getId(), 0));
            vo.setFollowerCount(followerCountMap.getOrDefault(p.getId(), 0));
            vo.setCreatedAt(p.getCreatedAt());
            return vo;
        }).collect(Collectors.toList());

        return new PageResult<>(page.getCurrent(), page.getSize(), page.getTotal(), page.getPages(), list);
    }

    @Override
    public PlaylistDetailVO getPlaylistDetail(Long playlistId) {
        String metaKey = "auramix:cache:playlist:" + playlistId + ":meta";
        PlaylistMetaCacheDTO playlistMeta = (PlaylistMetaCacheDTO) redisTemplate.opsForValue().get(metaKey);
        if (playlistMeta == null) {
            Playlist playlist = playlistMapper.selectById(playlistId);
            if (playlist == null) {
                throw new BusinessException(ResultCode.NOT_FOUND, "歌单不存在");
            }
            playlistMeta = new PlaylistMetaCacheDTO();
            playlistMeta.setOwnerId(playlist.getOwnerId());
            
            // 缓存创建者姓名
            User owner = userMapper.selectById(playlist.getOwnerId());
            if (owner != null) {
                playlistMeta.setOwnerName(owner.getDisplayName());
            }
            
            playlistMeta.setName(playlist.getName());
            playlistMeta.setDescription(playlist.getDescription());
            playlistMeta.setCoverUrl(playlist.getCoverUrl());
            playlistMeta.setIsPublic(playlist.getIsPublic());
            playlistMeta.setCreatedAt(playlist.getCreatedAt());
            playlistMeta.setUpdatedAt(playlist.getUpdatedAt());
            redisTemplate.opsForValue().set(metaKey, playlistMeta, 15, TimeUnit.MINUTES);
        }

        Long currentUserId = getCurrentUserIdOrNull();

        // 私密歌单仅创建者可见
        if (Boolean.FALSE.equals(playlistMeta.getIsPublic())) {
            if (currentUserId == null || !currentUserId.equals(playlistMeta.getOwnerId())) {
                throw new BusinessException(ResultCode.FORBIDDEN, "无权查看该歌曲");
            }
        }

        PlaylistDetailVO detail = new PlaylistDetailVO();
        detail.setId(playlistId);
        detail.setOwnerId(playlistMeta.getOwnerId());
        detail.setOwnerName(playlistMeta.getOwnerName());
        detail.setName(playlistMeta.getName());
        detail.setDescription(playlistMeta.getDescription());
        detail.setCoverUrl(playlistMeta.getCoverUrl());
        detail.setIsPublic(playlistMeta.getIsPublic());
        detail.setCreatedAt(playlistMeta.getCreatedAt());
        detail.setUpdatedAt(playlistMeta.getUpdatedAt());

        // isOwner (isFollowing removed as per client-side sync design)
        detail.setIsOwner(currentUserId != null && currentUserId.equals(playlistMeta.getOwnerId()));

        // 歌曲列表
        String relKey = "auramix:cache:playlist:" + playlistId + ":list";
        String relJson = stringRedisTemplate.opsForValue().get(relKey);
        List<PlaylistTrackRelationDTO> playlistTracks = null;
        try {
            if (relJson != null) {
                playlistTracks = MAPPER.readValue(relJson, new TypeReference<List<PlaylistTrackRelationDTO>>(){});
            }
        } catch (Exception e) {
            log.error("Failed to parse playlistTrackRelations json", e);
        }

        if (playlistTracks == null) {
            List<PlaylistTrack> dbTracks = playlistTrackMapper.selectList(
                    new LambdaQueryWrapper<PlaylistTrack>()
                            .eq(PlaylistTrack::getPlaylistId, playlistId)
                            .orderByAsc(PlaylistTrack::getSortOrder));
            playlistTracks = dbTracks.stream().map(pt -> {
                PlaylistTrackRelationDTO dto = new PlaylistTrackRelationDTO();
                dto.setTrackId(pt.getTrackId());
                dto.setSortOrder(pt.getSortOrder());
                dto.setAddedAt(pt.getAddedAt());
                return dto;
            }).collect(Collectors.toList());
            
            try {
                String jsonStr = MAPPER.writeValueAsString(playlistTracks);
                stringRedisTemplate.opsForValue().set(relKey, jsonStr, 15, TimeUnit.MINUTES);
            } catch (Exception e) {
                log.error("Failed to serialize playlistTrackRelations", e);
            }
        }

        detail.setTrackCount(playlistTracks.size());

        if (playlistTracks.isEmpty()) {
            detail.setTracks(new ArrayList<>());
        } else {
            List<Long> trackIds = playlistTracks.stream().map(PlaylistTrackRelationDTO::getTrackId).collect(Collectors.toList());
            Map<Long, TrackMetaCacheDTO> trackMetaMap = trackCacheService.getTrackMetaBatch(trackIds);

            List<Long> allArtistIds = trackMetaMap.values().stream()
                    .filter(Objects::nonNull)
                    .map(TrackMetaCacheDTO::getArtistRelations)
                    .filter(Objects::nonNull)
                    .flatMap(List::stream)
                    .map(TrackMetaCacheDTO.ArtistRelation::getArtistId)
                    .distinct()
                    .collect(Collectors.toList());

            Map<Long, ArtistMetaCacheDTO> artistMetaMap = artistCacheService.getArtistMetaBatch(allArtistIds);

            List<PlaylistTrackItemVO> trackItems = playlistTracks.stream().map(pt -> {
                TrackMetaCacheDTO meta = trackMetaMap.get(pt.getTrackId());
                if (meta == null) {
                    return null;
                }
                
                PlaylistTrackItemVO item = new PlaylistTrackItemVO();
                item.setTrackId(pt.getTrackId());
                item.setSortOrder(pt.getSortOrder());
                item.setAddedAt(pt.getAddedAt());

                item.setTitle(meta.getTitle());
                item.setDuration(meta.getDuration());
                item.setMember(meta.getMember());
                item.setCoverUrl(meta.getCoverUrl());
                item.setAlbumTitle(meta.getAlbumTitle());
                item.setAlbumId(meta.getAlbumId());
                if (meta.getArtistRelations() != null) {
                    item.setArtists(meta.getArtistRelations().stream().map(ar -> {
                        ArtistMetaCacheDTO artistMeta = artistMetaMap.get(ar.getArtistId());
                        if (artistMeta != null) {
                            com.son.auramix.domain.vo.user.ArtistInfoVO av = new com.son.auramix.domain.vo.user.ArtistInfoVO();
                            av.setId(ar.getArtistId());
                            av.setName(artistMeta.getName());
                            av.setRole(ar.getRole());
                            return av;
                        }
                        return null;
                    }).filter(Objects::nonNull).collect(Collectors.toList()));
                }
                if (meta.getGenres() != null) {
                    item.setGenres(meta.getGenres().stream().map(g -> {
                        com.son.auramix.domain.vo.admin.GenreVO gv = new com.son.auramix.domain.vo.admin.GenreVO();
                        gv.setId(g.getId());
                        gv.setName(g.getName());
                        return gv;
                    }).collect(Collectors.toList()));
                }
                
                return item;
            }).filter(Objects::nonNull).collect(Collectors.toList());

            detail.setTracks(trackItems);
        }

        // followerCount 缓存逻辑
        String followCountKey = "auramix:cache:playlist:" + playlistId + ":followCount";
        String cachedFollowerCount = stringRedisTemplate.opsForValue().get(followCountKey);
        if (cachedFollowerCount != null) {
            detail.setFollowerCount(Integer.parseInt(cachedFollowerCount));
        } else {
            Long followerCount = playlistFollowerMapper.selectCount(
                    new LambdaQueryWrapper<PlaylistFollower>().eq(PlaylistFollower::getPlaylistId, playlistId));
            detail.setFollowerCount(followerCount.intValue());
            stringRedisTemplate.opsForValue().set(followCountKey, String.valueOf(followerCount), 30, TimeUnit.MINUTES);
        }

        return detail;
    }

    @Override
    @Transactional
    public void followPlaylist(Long playlistId) {
        Long userId = getCurrentUserId();
        Playlist playlist = playlistMapper.selectById(playlistId);
        if (playlist == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "歌单不存在");
        }
        if (Boolean.FALSE.equals(playlist.getIsPublic())) {
            throw new BusinessException(ResultCode.FORBIDDEN, "不能关注私密歌单");
        }
        if (userId.equals(playlist.getOwnerId())) {
            throw new BusinessException(ResultCode.BAD_REQUEST, "不能关注自己的歌单");
        }

        // 幂等：已关注则跳�?
        Long exists = playlistFollowerMapper.selectCount(
                new LambdaQueryWrapper<PlaylistFollower>()
                        .eq(PlaylistFollower::getPlaylistId, playlistId)
                        .eq(PlaylistFollower::getUserId, userId));
        if (exists > 0) {
            return;
        }

        PlaylistFollower follower = new PlaylistFollower();
        follower.setPlaylistId(playlistId);
        follower.setUserId(userId);
        follower.setFollowedAt(java.time.LocalDateTime.now());
        playlistFollowerMapper.insert(follower);

        String followCountKey = "auramix:cache:playlist:" + playlistId + ":followCount";
        if (Boolean.TRUE.equals(stringRedisTemplate.hasKey(followCountKey))) {
            stringRedisTemplate.opsForValue().increment(followCountKey);
        }

        log.info("[PlaylistService] 关注歌单 playlistId={}, userId={}", playlistId, userId);
    }

    @Override
    @Transactional
    public void unfollowPlaylist(Long playlistId) {
        Long userId = getCurrentUserId();
        // 幂等：未关注也直接返回成功
        int deleted = playlistFollowerMapper.delete(
                new LambdaQueryWrapper<PlaylistFollower>()
                        .eq(PlaylistFollower::getPlaylistId, playlistId)
                        .eq(PlaylistFollower::getUserId, userId));
        if (deleted > 0) {
            String followCountKey = "auramix:cache:playlist:" + playlistId + ":followCount";
            if (Boolean.TRUE.equals(stringRedisTemplate.hasKey(followCountKey))) {
                stringRedisTemplate.opsForValue().decrement(followCountKey);
            }
        }
        log.info("[PlaylistService] 取消关注歌单 playlistId={}, userId={}", playlistId, userId);
    }

    @Override
    public PageResult<PlaylistSearchItemVO> listFollowedPlaylists(Integer pageNum, Integer pageSize) {
        Long userId = getCurrentUserId();
        int current = pageNum == null || pageNum < 1 ? 1 : pageNum;
        int size = pageSize == null || pageSize < 1 ? 10 : (pageSize > 100 ? 100 : pageSize);

        // 查询当前用户所有关注记录（�?followed_at DESC�?
        List<PlaylistFollower> allFollowed = playlistFollowerMapper.selectList(
                new LambdaQueryWrapper<PlaylistFollower>()
                        .eq(PlaylistFollower::getUserId, userId)
                        .orderByDesc(PlaylistFollower::getFollowedAt));

        if (allFollowed.isEmpty()) {
            return new PageResult<>((long) current, (long) size, 0L, 0L, new ArrayList<>());
        }

        List<Long> allPlaylistIds = allFollowed.stream()
                .map(PlaylistFollower::getPlaylistId)
                .collect(Collectors.toList());

        // 查询对应的公开歌单
        List<Playlist> publicPlaylists = playlistMapper.selectList(
                new LambdaQueryWrapper<Playlist>()
                        .in(Playlist::getId, allPlaylistIds)
                        .eq(Playlist::getIsPublic, true));
        Map<Long, Playlist> publicMap = publicPlaylists.stream()
                .collect(Collectors.toMap(Playlist::getId, p -> p));

        // �?followed_at 顺序过滤出公开歌单
        List<Long> publicFollowedIds = allFollowed.stream()
                .map(PlaylistFollower::getPlaylistId)
                .filter(publicMap::containsKey)
                .collect(Collectors.toList());

        long total = publicFollowedIds.size();
        int fromIndex = (current - 1) * size;
        if (fromIndex >= publicFollowedIds.size()) {
            long pages = (total + size - 1) / size;
            return new PageResult<>((long) current, (long) size, total, pages, new ArrayList<>());
        }
        int toIndex = Math.min(fromIndex + size, publicFollowedIds.size());
        List<Long> pageIds = new ArrayList<>(publicFollowedIds.subList(fromIndex, toIndex));

        // 批量查询 ownerName、trackCount、followerCount（只查当前页�?IDs�?
        List<Playlist> pagePlaylists = pageIds.stream()
                .map(publicMap::get)
                .collect(Collectors.toList());
        List<Long> ownerIds = pagePlaylists.stream().map(Playlist::getOwnerId).distinct().collect(Collectors.toList());
        Map<Long, String> ownerNameMap = batchQueryOwnerNames(ownerIds);
        Map<Long, Integer> trackCountMap = batchQueryTrackCounts(pageIds);
        Map<Long, Integer> followerCountMap = batchQueryFollowerCounts(pageIds);

        List<PlaylistSearchItemVO> list = pagePlaylists.stream().map(p -> {
            PlaylistSearchItemVO vo = new PlaylistSearchItemVO();
            vo.setId(p.getId());
            vo.setName(p.getName());
            vo.setDescription(p.getDescription());
            vo.setCoverUrl(p.getCoverUrl());
            vo.setOwnerName(ownerNameMap.get(p.getOwnerId()));
            vo.setTrackCount(trackCountMap.getOrDefault(p.getId(), 0));
            vo.setFollowerCount(followerCountMap.getOrDefault(p.getId(), 0));
            vo.setCreatedAt(p.getCreatedAt());
            return vo;
        }).collect(Collectors.toList());

        long pages = (total + size - 1) / size;
        return new PageResult<>((long) current, (long) size, total, pages, list);
    }

    // ============================ 私有方法 ============================

    /**
     * 查询歌单并校验归属权
     */
    private Playlist getOwnedPlaylist(Long ownerId, Long playlistId) {
        Playlist playlist = playlistMapper.selectById(playlistId);
        if (playlist == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "歌单不存在");
        }
        if (!ownerId.equals(playlist.getOwnerId())) {
            throw new BusinessException(ResultCode.FORBIDDEN, "无权操作该歌曲");
        }
        return playlist;
    }

    private PlaylistVO toResponse(Playlist p) {
        PlaylistVO resp = new PlaylistVO();
        resp.setId(p.getId());
        resp.setOwnerId(p.getOwnerId());
        resp.setName(p.getName());
        resp.setDescription(p.getDescription());
        resp.setCoverUrl(p.getCoverUrl());
        resp.setIsPublic(p.getIsPublic());
        resp.setCreatedAt(p.getCreatedAt());
        resp.setUpdatedAt(p.getUpdatedAt());
        return resp;
    }

    /**
     * 批量查询用户�?
     */
    private Map<Long, String> batchQueryOwnerNames(List<Long> ownerIds) {
        if (ownerIds == null || ownerIds.isEmpty()) return new HashMap<>();
        List<User> users = userMapper.selectBatchIds(ownerIds);
        return users.stream().collect(Collectors.toMap(User::getId, User::getDisplayName));
    }

    /**
     * 批量查询歌单的歌曲数量（聚合查询�?
     */
    private Map<Long, Integer> batchQueryTrackCounts(List<Long> playlistIds) {
        if (playlistIds == null || playlistIds.isEmpty()) return new HashMap<>();
        QueryWrapper<PlaylistTrack> wrapper = new QueryWrapper<PlaylistTrack>()
                .select("playlist_id", "COUNT(*) AS cnt")
                .in("playlist_id", playlistIds)
                .groupBy("playlist_id");
        List<Map<String, Object>> maps = playlistTrackMapper.selectMaps(wrapper);
        Map<Long, Integer> result = new HashMap<>();
        for (Map<String, Object> m : maps) {
            Long pid = ((Number) m.get("playlist_id")).longValue();
            Integer cnt = ((Number) m.get("cnt")).intValue();
            result.put(pid, cnt);
        }
        return result;
    }

    /**
     * 批量查询歌单的关注者数量（聚合查询�?
     */
    private Map<Long, Integer> batchQueryFollowerCounts(List<Long> playlistIds) {
        if (playlistIds == null || playlistIds.isEmpty()) return new HashMap<>();
        QueryWrapper<PlaylistFollower> wrapper = new QueryWrapper<PlaylistFollower>()
                .select("playlist_id", "COUNT(*) AS cnt")
                .in("playlist_id", playlistIds)
                .groupBy("playlist_id");
        List<Map<String, Object>> maps = playlistFollowerMapper.selectMaps(wrapper);
        Map<Long, Integer> result = new HashMap<>();
        for (Map<String, Object> m : maps) {
            Long pid = ((Number) m.get("playlist_id")).longValue();
            Integer cnt = ((Number) m.get("cnt")).intValue();
            result.put(pid, cnt);
        }
        return result;
    }
}
