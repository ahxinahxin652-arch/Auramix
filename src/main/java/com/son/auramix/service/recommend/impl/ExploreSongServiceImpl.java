package com.son.auramix.service.recommend.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.son.auramix.domain.entity.*;
import com.son.auramix.domain.vo.user.ArtistInfoVO;
import com.son.auramix.domain.vo.user.RecommendTrackVO;
import com.son.auramix.mapper.*;
import com.son.auramix.service.recommend.ExploreSongService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

/**
 * 探索发现推荐服务实现
 * <p>
 * 每日 00:00 离线计算，为每个用户生成 10 首探索发现歌曲（source=3）。
 * <p>
 * 算法流程：
 * <ol>
 *   <li>读取用户偏好向量，计算各流派的熟悉度权重</li>
 *   <li>筛选候选歌曲：优先无流派/未听过流派，其次按流派熟悉度从低到高</li>
 *   <li>排除已红心歌曲（liked_tracks）</li>
 *   <li>排除近 30 天播放过的歌曲（playback_history）</li>
 *   <li>音频特征筛选：与用户近期听歌基准差异过大的排除</li>
 *   <li>按 play_count 升序取冷门歌曲，最终返回 10 首</li>
 * </ol>
 *
 * @author auramix
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ExploreSongServiceImpl implements ExploreSongService {

    // ===== Redis Key =====
    private static final String EXPLORE_REDIS_PREFIX = "auramix:user:explore:";

    // ===== 探索推荐数量 =====
    private static final int EXPLORE_COUNT = 10;

    // ===== 排除时间窗口 =====
    private static final int RECENT_EXCLUDE_DAYS = 30;

    // ===== 候选池大小（流派排序后、音频筛选前） =====
    private static final int CANDIDATE_POOL_SIZE = 200;

    // ===== 音频特征差异阈值 =====
    private static final double TEMPO_THRESHOLD = 50.0;
    private static final double FEATURE_THRESHOLD = 0.4;

    // ===== 探索推荐的起始 rank（每日偏好推荐占用 1-20） =====
    private static final int EXPLORE_BASE_RANK = 21;

    // ===== 依赖 =====
    private final UserPreferenceVectorMapper userPreferenceVectorMapper;
    private final DailyRecommendationMapper dailyRecommendationMapper;
    private final TrackMapper trackMapper;
    private final TrackGenreMapper trackGenreMapper;
    private final TrackAudioFeatureMapper trackAudioFeatureMapper;
    private final LikedTrackMapper likedTrackMapper;
    private final PlaybackHistoryMapper playbackHistoryMapper;
    private final TrackArtistMapper trackArtistMapper;
    private final TrackAudioResourceMapper trackAudioResourceMapper;
    private final AlbumMapper albumMapper;
    private final ArtistMapper artistMapper;
    private final UserMapper userMapper;
    private final StringRedisTemplate stringRedisTemplate;
    private final ObjectMapper objectMapper;

    // ======================== 全量计算（定时任务入口） ========================

    @Override
    public void computeAll() {
        log.info("[探索发现] 开始全量计算");
        long startTime = System.currentTimeMillis();

        // 1. 预加载共享数据
        List<Track> activeTracks = trackMapper.selectList(
                new LambdaQueryWrapper<Track>().eq(Track::getStatus, 0));
        Set<Long> activeTrackIds = activeTracks.stream().map(Track::getId).collect(Collectors.toSet());
        Map<Long, Set<Long>> trackGenreMap = loadTrackGenres(activeTrackIds);

        log.info("[探索发现] 活跃歌曲={}首", activeTracks.size());

        // 2. 获取所有用户
        List<Long> userIds = userMapper.selectList(null).stream()
                .map(User::getId).collect(Collectors.toList());

        // 3. 逐用户计算
        LocalDate today = LocalDate.now();
        int success = 0, skip = 0, fail = 0;
        for (Long userId : userIds) {
            try {
                boolean generated = computeForUser(userId, activeTracks, trackGenreMap, today);
                if (generated) success++;
                else skip++;
            } catch (Exception e) {
                log.error("[探索发现] 计算失败 userId={}", userId, e);
                fail++;
            }
        }

        log.info("[探索发现] 全量计算完成, 成功={}, 跳过={}, 失败={}, 耗时={}ms",
                success, skip, fail, System.currentTimeMillis() - startTime);
    }

    /**
     * 计算单个用户的探索发现推荐
     *
     * @return true 表示生成了探索推荐，false 表示跳过（如无偏好向量）
     */
    private boolean computeForUser(Long userId, List<Track> activeTracks,
                                    Map<Long, Set<Long>> trackGenreMap, LocalDate today) {
        // 1. 读取用户偏好向量
        UserPreferenceVector vector = userPreferenceVectorMapper.selectById(userId);
        if (vector == null) {
            log.debug("[探索发现] 用户无偏好向量，跳过 userId={}", userId);
            return false;
        }

        // 2. 计算用户对各流派的熟悉度权重
        Map<String, Double> longTermGenre = fromJson(vector.getLongTermGenre());
        Map<String, Double> shortTermGenre = fromJson(vector.getShortTermGenre());
        double fusionRatio = vector.getFusionRatio() != null ? vector.getFusionRatio().doubleValue() : 0.5;
        Map<Long, Double> genreFamiliarity = computeGenreFamiliarity(longTermGenre, shortTermGenre, fusionRatio);
        // 听过的流派集合（权重 > 0）
        Set<Long> listenedGenres = genreFamiliarity.entrySet().stream()
                .filter(e -> e.getValue() > 0)
                .map(Map.Entry::getKey)
                .collect(Collectors.toSet());

        // 3. 排除已红心歌曲
        Set<Long> likedTrackIds = getLikedTrackIds(userId);

        // 4. 排除近 30 天播放过的歌曲，并以此作为音频特征基准
        Set<Long> recentPlayedTrackIds = getRecentPlayedTrackIds(userId, RECENT_EXCLUDE_DAYS);

        // 5. 计算用户音频特征基准（基于近期听过的歌曲）
        AudioFeatureBaseline baseline = computeAudioBaseline(recentPlayedTrackIds);

        // 6. 筛选候选并打分
        List<CandidateTrack> candidates = new ArrayList<>();
        for (Track track : activeTracks) {
            Long trackId = track.getId();
            // 硬排除：已红心
            if (likedTrackIds.contains(trackId)) continue;
            // 硬排除：近 30 天听过
            if (recentPlayedTrackIds.contains(trackId)) continue;

            Set<Long> genres = trackGenreMap.getOrDefault(trackId, Set.of());
            // 流派优先级分数：越低越优先（从未听过/无流派 → 最低）
            double genrePriority = computeGenrePriority(genres, genreFamiliarity, listenedGenres);

            candidates.add(new CandidateTrack(trackId, genrePriority, track.getPlayCount()));
        }

        if (candidates.isEmpty()) {
            log.debug("[探索发现] 无候选歌曲 userId={}", userId);
            return false;
        }

        // 7. 按流派优先级排序，取候选池前 N
        candidates.sort(Comparator.comparingDouble(CandidateTrack::genrePriority));
        List<CandidateTrack> pool = candidates.subList(0, Math.min(CANDIDATE_POOL_SIZE, candidates.size()));

        // 8. 音频特征筛选：排除与用户基准差异过大的
        List<CandidateTrack> filtered = filterByAudioFeatures(pool, baseline);
        // 若筛选后不足 10 首，回退使用筛选前的候选池
        if (filtered.size() < EXPLORE_COUNT) {
            log.debug("[探索发现] 音频筛选后不足10首({}首)，回退候选池 userId={}", filtered.size(), userId);
            filtered = new ArrayList<>(pool);
        }

        // 9. 按 play_count 升序取冷门歌曲（null 视为最大，排最后）
        filtered.sort(Comparator.comparing(CandidateTrack::playCount,
                Comparator.nullsLast(Comparator.naturalOrder())));
        List<CandidateTrack> topN = filtered.subList(0, Math.min(EXPLORE_COUNT, filtered.size()));

        // 10. 删除今日 source=3 的旧记录，批量插入新记录
        dailyRecommendationMapper.delete(
                new LambdaQueryWrapper<DailyRecommendation>()
                        .eq(DailyRecommendation::getUserId, userId)
                        .eq(DailyRecommendation::getRecommendDate, today)
                        .eq(DailyRecommendation::getSource, DailyRecommendation.SOURCE_DISCOVER));

        List<DailyRecommendation> recs = new ArrayList<>();
        for (int i = 0; i < topN.size(); i++) {
            CandidateTrack ct = topN.get(i);
            DailyRecommendation rec = new DailyRecommendation();
            rec.setUserId(userId);
            rec.setTrackId(ct.trackId);
            rec.setRecommendDate(today);
            rec.setRank(EXPLORE_BASE_RANK + i);
            rec.setReasonTag("探索发现");
            rec.setSource(DailyRecommendation.SOURCE_DISCOVER);
            recs.add(rec);
        }
        if (!recs.isEmpty()) {
            dailyRecommendationMapper.batchInsert(recs);
        }

        log.debug("[探索发现] 生成 userId={}, 推荐={}首", userId, recs.size());
        return true;
    }

    // ======================== 流派熟悉度计算 ========================

    /**
     * 计算用户对各流派的熟悉度权重（长期 + 短期融合）
     *
     * @return Map<genreId, weight>，权重越高表示越熟悉
     */
    private Map<Long, Double> computeGenreFamiliarity(Map<String, Double> longTerm,
                                                       Map<String, Double> shortTerm,
                                                       double fusionRatio) {
        Map<Long, Double> result = new HashMap<>();
        Set<String> allKeys = new HashSet<>();
        allKeys.addAll(longTerm.keySet());
        allKeys.addAll(shortTerm.keySet());
        for (String key : allKeys) {
            double longVal = longTerm.getOrDefault(key, 0.0);
            double shortVal = shortTerm.getOrDefault(key, 0.0);
            double fused = fusionRatio * longVal + (1 - fusionRatio) * shortVal;
            try {
                result.put(Long.parseLong(key), fused);
            } catch (NumberFormatException ignored) {
            }
        }
        return result;
    }

    /**
     * 计算歌曲的流派优先级分数
     * <p>
     * 优先级规则（分数越低越优先）：
     * <ul>
     *   <li>无流派 → -2.0（最优先）</li>
     *   <li>所有流派都未听过 → -1.0（次优先）</li>
     *   <li>有听过的流派 → 该歌曲所有流派熟悉度的平均值（越低越优先）</li>
     * </ul>
     */
    private double computeGenrePriority(Set<Long> genres, Map<Long, Double> genreFamiliarity,
                                         Set<Long> listenedGenres) {
        if (genres == null || genres.isEmpty()) {
            return -2.0; // 无流派，最优先
        }
        double sum = 0.0;
        boolean anyListened = false;
        for (Long genreId : genres) {
            double weight = genreFamiliarity.getOrDefault(genreId, 0.0);
            if (weight > 0 || listenedGenres.contains(genreId)) {
                anyListened = true;
            }
            sum += weight;
        }
        if (!anyListened) {
            return -1.0; // 所有流派都未听过，次优先
        }
        return sum / genres.size(); // 平均熟悉度，越低越优先
    }

    // ======================== 音频特征筛选 ========================

    /**
     * 计算用户近期听过的歌曲的音频特征基准（中位数）
     */
    private AudioFeatureBaseline computeAudioBaseline(Set<Long> recentPlayedTrackIds) {
        if (recentPlayedTrackIds == null || recentPlayedTrackIds.isEmpty()) {
            return null; // 冷启动用户无基准
        }
        List<TrackAudioFeature> features = trackAudioFeatureMapper.selectList(
                new LambdaQueryWrapper<TrackAudioFeature>()
                        .in(TrackAudioFeature::getTrackId, recentPlayedTrackIds));
        if (features.isEmpty()) {
            return null;
        }
        AudioFeatureBaseline baseline = new AudioFeatureBaseline();
        baseline.tempo = median(features.stream()
                .map(TrackAudioFeature::getTempo)
                .filter(Objects::nonNull)
                .map(BigDecimal::doubleValue)
                .sorted()
                .collect(Collectors.toList()));
        baseline.energy = median(features.stream()
                .map(TrackAudioFeature::getEnergy)
                .filter(Objects::nonNull)
                .map(BigDecimal::doubleValue)
                .sorted()
                .collect(Collectors.toList()));
        baseline.valence = median(features.stream()
                .map(TrackAudioFeature::getValence)
                .filter(Objects::nonNull)
                .map(BigDecimal::doubleValue)
                .sorted()
                .collect(Collectors.toList()));
        baseline.danceability = median(features.stream()
                .map(TrackAudioFeature::getDanceability)
                .filter(Objects::nonNull)
                .map(BigDecimal::doubleValue)
                .sorted()
                .collect(Collectors.toList()));
        return baseline;
    }

    /**
     * 筛选音频特征与用户基准差异过大的歌曲
     * <p>
     * 若用户无基准（冷启动），跳过筛选直接返回全部候选。
     */
    private List<CandidateTrack> filterByAudioFeatures(List<CandidateTrack> pool, AudioFeatureBaseline baseline) {
        if (baseline == null || !baseline.isValid()) {
            return new ArrayList<>(pool);
        }
        Set<Long> trackIds = pool.stream().map(CandidateTrack::trackId).collect(Collectors.toSet());
        Map<Long, TrackAudioFeature> featureMap = trackAudioFeatureMapper.selectList(
                new LambdaQueryWrapper<TrackAudioFeature>()
                        .in(TrackAudioFeature::getTrackId, trackIds))
                .stream()
                .collect(Collectors.toMap(TrackAudioFeature::getTrackId, f -> f, (a, b) -> a));

        List<CandidateTrack> result = new ArrayList<>();
        for (CandidateTrack ct : pool) {
            TrackAudioFeature feature = featureMap.get(ct.trackId);
            if (feature == null) {
                // 无音频特征数据的歌曲保留（不排除）
                result.add(ct);
                continue;
            }
            if (isAudioDiffTooLarge(feature, baseline)) {
                continue; // 差异过大，排除
            }
            result.add(ct);
        }
        return result;
    }

    /**
     * 判断歌曲音频特征与基准是否差异过大
     */
    private boolean isAudioDiffTooLarge(TrackAudioFeature feature, AudioFeatureBaseline baseline) {
        if (feature.getTempo() != null && baseline.tempo != null) {
            double diff = Math.abs(feature.getTempo().doubleValue() - baseline.tempo);
            if (diff > TEMPO_THRESHOLD) return true;
        }
        if (feature.getEnergy() != null && baseline.energy != null) {
            double diff = Math.abs(feature.getEnergy().doubleValue() - baseline.energy);
            if (diff > FEATURE_THRESHOLD) return true;
        }
        if (feature.getValence() != null && baseline.valence != null) {
            double diff = Math.abs(feature.getValence().doubleValue() - baseline.valence);
            if (diff > FEATURE_THRESHOLD) return true;
        }
        if (feature.getDanceability() != null && baseline.danceability != null) {
            double diff = Math.abs(feature.getDanceability().doubleValue() - baseline.danceability);
            if (diff > FEATURE_THRESHOLD) return true;
        }
        return false;
    }

    private double median(List<Double> sorted) {
        if (sorted.isEmpty()) return 0.0;
        int n = sorted.size();
        if (n % 2 == 1) return sorted.get(n / 2);
        return (sorted.get(n / 2 - 1) + sorted.get(n / 2)) / 2.0;
    }

    // ======================== Redis 缓存 + VO 构建 ========================

    @Override
    public List<RecommendTrackVO> getExploreRecommendations(Long userId) {
        String key = EXPLORE_REDIS_PREFIX + userId;
        String json = stringRedisTemplate.opsForValue().get(key);

        List<Map<String, Object>> exploreList = null;

        if (json != null && !json.isBlank()) {
            try {
                exploreList = objectMapper.readValue(json, new TypeReference<List<Map<String, Object>>>() {});
            } catch (Exception e) {
                log.warn("[探索发现] Redis解析失败 userId={}, 回退DB", userId);
            }
        }

        if (exploreList == null) {
            // Redis 未命中或过期 → 从 DB 加载并重新缓存
            LocalDate today = LocalDate.now();
            List<DailyRecommendation> recs = dailyRecommendationMapper.selectList(
                    new LambdaQueryWrapper<DailyRecommendation>()
                            .eq(DailyRecommendation::getUserId, userId)
                            .eq(DailyRecommendation::getRecommendDate, today)
                            .eq(DailyRecommendation::getSource, DailyRecommendation.SOURCE_DISCOVER)
                            .orderByAsc(DailyRecommendation::getRank));

            if (recs.isEmpty()) {
                log.info("[探索发现] 无推荐数据 userId={}", userId);
                return List.of();
            }

            exploreList = new ArrayList<>();
            for (DailyRecommendation rec : recs) {
                Map<String, Object> m = new LinkedHashMap<>();
                m.put("trackId", rec.getTrackId());
                m.put("rank", rec.getRank());
                m.put("source", rec.getSource());
                m.put("reasonTag", rec.getReasonTag());
                exploreList.add(m);
            }
            try {
                stringRedisTemplate.opsForValue()
                        .set(key, objectMapper.writeValueAsString(exploreList), ttlUntilMidnight());
                log.info("[探索发现] Redis过期, 从DB重新缓存 userId={} count={}", userId, exploreList.size());
            } catch (Exception e) {
                log.warn("[探索发现] 重新缓存失败 userId={}", userId);
            }
        }

        return buildRecommendVOs(exploreList);
    }

    /**
     * 从推荐列表构建含播放信息的 VO
     */
    private List<RecommendTrackVO> buildRecommendVOs(List<Map<String, Object>> list) {
        List<Long> trackIds = list.stream()
                .map(m -> parseLong(m, "trackId"))
                .filter(Objects::nonNull)
                .collect(Collectors.toList());
        if (trackIds.isEmpty()) return List.of();

        Map<Long, Track> trackMap = trackMapper.selectBatchIds(trackIds).stream()
                .collect(Collectors.toMap(Track::getId, t -> t, (a, b) -> a));

        Set<Long> albumIds = trackMap.values().stream()
                .map(Track::getAlbumId).filter(Objects::nonNull).collect(Collectors.toSet());
        Map<Long, Album> albumMap = albumIds.isEmpty() ? Map.of() :
                albumMapper.selectBatchIds(albumIds).stream()
                        .collect(Collectors.toMap(Album::getId, a -> a, (a, b) -> a));

        Map<Long, List<ArtistInfoVO>> artistMap = new HashMap<>();
        List<TrackArtist> trackArtists = trackArtistMapper.selectList(
                new LambdaQueryWrapper<TrackArtist>().in(TrackArtist::getTrackId, trackIds));
        Set<Long> artistIdSet = trackArtists.stream()
                .map(TrackArtist::getArtistId).collect(Collectors.toSet());
        Map<Long, Artist> artistsById = artistIdSet.isEmpty() ? Map.of() :
                artistMapper.selectBatchIds(artistIdSet).stream()
                        .collect(Collectors.toMap(Artist::getId, a -> a, (a, b) -> a));
        for (TrackArtist ta : trackArtists) {
            Artist artist = artistsById.get(ta.getArtistId());
            if (artist != null) {
                ArtistInfoVO info = new ArtistInfoVO();
                info.setId(artist.getId());
                info.setName(artist.getName());
                info.setRole(ta.getRole());
                artistMap.computeIfAbsent(ta.getTrackId(), k -> new ArrayList<>()).add(info);
            }
        }

        Map<Long, TrackAudioResource> audioMap = new HashMap<>();
        List<TrackAudioResource> audioResources = trackAudioResourceMapper.selectList(
                new LambdaQueryWrapper<TrackAudioResource>()
                        .in(TrackAudioResource::getTrackId, trackIds)
                        .orderByDesc(TrackAudioResource::getBitrate));
        for (TrackAudioResource ar : audioResources) {
            audioMap.putIfAbsent(ar.getTrackId(), ar);
        }

        List<RecommendTrackVO> result = new ArrayList<>();
        for (Map<String, Object> m : list) {
            Long tid = parseLong(m, "trackId");
            if (tid == null) continue;

            Track track = trackMap.get(tid);
            if (track == null) continue;

            RecommendTrackVO vo = new RecommendTrackVO();
            vo.setTrackId(tid);
            vo.setTitle(track.getTitle());
            vo.setDuration(track.getDuration());
            vo.setMember(track.getMember());

            Album album = albumMap.get(track.getAlbumId());
            if (album != null) {
                vo.setAlbumTitle(album.getTitle());
                vo.setCoverUrl(album.getCoverUrl());
            }

            vo.setArtists(artistMap.getOrDefault(tid, List.of()));

            TrackAudioResource audio = audioMap.get(tid);
            if (audio != null) {
                vo.setAudioUrl(audio.getStreamUrl());
            }

            Integer rank = parseInt(m, "rank");
            if (rank != null && rank > 0) {
                vo.setScore(1.0 / rank);
            }

            Integer source = parseInt(m, "source");
            if (source != null) {
                vo.setSources(List.of(sourceToString(source)));
            }

            result.add(vo);
        }

        return result;
    }

    // ======================== 私有工具方法 ========================

    /**
     * 获取用户红心歌曲 ID 集合
     */
    private Set<Long> getLikedTrackIds(Long userId) {
        return likedTrackMapper.selectList(
                new LambdaQueryWrapper<LikedTrack>().eq(LikedTrack::getUserId, userId))
                .stream()
                .map(LikedTrack::getTrackId)
                .collect(Collectors.toSet());
    }

    /**
     * 获取用户近 N 天播放过的歌曲 ID 集合
     */
    private Set<Long> getRecentPlayedTrackIds(Long userId, int days) {
        LocalDateTime since = LocalDateTime.now().minusDays(days);
        return playbackHistoryMapper.selectList(
                new LambdaQueryWrapper<PlaybackHistory>()
                        .eq(PlaybackHistory::getUserId, userId)
                        .ge(PlaybackHistory::getPlayedAt, since))
                .stream()
                .map(PlaybackHistory::getTrackId)
                .collect(Collectors.toSet());
    }

    /**
     * 批量加载 track -> genreIds 映射
     */
    private Map<Long, Set<Long>> loadTrackGenres(Set<Long> trackIds) {
        Map<Long, Set<Long>> map = new HashMap<>();
        if (trackIds.isEmpty()) return map;
        List<TrackGenre> list = trackGenreMapper.selectList(
                new LambdaQueryWrapper<TrackGenre>().in(TrackGenre::getTrackId, trackIds));
        for (TrackGenre tg : list) {
            map.computeIfAbsent(tg.getTrackId(), k -> new HashSet<>()).add(tg.getGenreId());
        }
        return map;
    }

    /**
     * JSON → Map
     */
    private Map<String, Double> fromJson(String json) {
        if (json == null || json.isBlank()) return Map.of();
        try {
            return objectMapper.readValue(json, new TypeReference<Map<String, Double>>() {});
        } catch (Exception e) {
            return Map.of();
        }
    }

    /**
     * 计算到当日 00:00 的 TTL
     */
    private Duration ttlUntilMidnight() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime midnight = now.toLocalDate().plusDays(1).atStartOfDay();
        long seconds = Duration.between(now, midnight).getSeconds();
        return Duration.ofSeconds(Math.max(1, seconds));
    }

    /**
     * 推荐来源 int → String
     */
    private String sourceToString(int source) {
        switch (source) {
            case DailyRecommendation.SOURCE_LONG_TERM: return "long_term";
            case DailyRecommendation.SOURCE_SHORT_TERM: return "short_term";
            case DailyRecommendation.SOURCE_EXPLORE: return "explore";
            case DailyRecommendation.SOURCE_DISCOVER: return "discover";
            default: return "unknown";
        }
    }

    private Long parseLong(Map<String, Object> m, String key) {
        Object val = m.get(key);
        if (val == null) return null;
        if (val instanceof Number n) return n.longValue();
        if (val instanceof String s) {
            try { return Long.parseLong(s); } catch (NumberFormatException e) { return null; }
        }
        return null;
    }

    private Integer parseInt(Map<String, Object> m, String key) {
        Object val = m.get(key);
        if (val == null) return null;
        if (val instanceof Number n) return n.intValue();
        if (val instanceof String s) {
            try { return Integer.parseInt(s); } catch (NumberFormatException e) { return null; }
        }
        return null;
    }

    // ======================== 内部类 ========================

    /**
     * 候选歌曲
     */
    private static class CandidateTrack {
        final Long trackId;
        final double genrePriority;
        final Long playCount;

        CandidateTrack(Long trackId, double genrePriority, Long playCount) {
            this.trackId = trackId;
            this.genrePriority = genrePriority;
            this.playCount = playCount;
        }

        Long trackId() { return trackId; }
        double genrePriority() { return genrePriority; }
        Long playCount() { return playCount; }
    }

    /**
     * 用户音频特征基准（近期听歌中位数）
     */
    private static class AudioFeatureBaseline {
        Double tempo;
        Double energy;
        Double valence;
        Double danceability;

        boolean isValid() {
            return tempo != null || energy != null || valence != null || danceability != null;
        }
    }
}
