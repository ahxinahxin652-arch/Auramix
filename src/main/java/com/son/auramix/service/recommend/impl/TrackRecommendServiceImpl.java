package com.son.auramix.service.recommend.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.son.auramix.domain.entity.*;
import com.son.auramix.domain.vo.user.ArtistInfoVO;
import com.son.auramix.domain.vo.user.RecommendTrackVO;
import com.son.auramix.mapper.*;
import com.son.auramix.service.recommend.TrackRecommendService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.Duration;
import java.util.*;
import java.util.concurrent.CompletableFuture;
import java.util.stream.Collectors;

/**
 * 歌曲相似推荐服务实现
 * <p>
 * 三路融合：内容相似 + 协同过滤 + 文化相似
 *
 * @author auramix
 */
@Slf4j
@Service
public class TrackRecommendServiceImpl implements TrackRecommendService {

    // ===== Redis Key =====
    private static final String RECOMMEND_REDIS_PREFIX = "auramix:recommend:similar:";
    private static final String CF_REDIS_PREFIX = "auramix:cf:similar:";
    private static final Duration RECOMMEND_TTL = Duration.ofHours(24);

    // ===== 最终输出 =====
    private static final int FINAL_TOP_N = 20;

    // ===== 权重融合 =====
    private static final double W_CONTENT = 0.4;
    private static final double W_CF = 0.35;
    private static final double W_CULTURE = 0.25;

    // ===== 内容过滤阈值 =====
    private static final int KEY_FILTER_THRESHOLD = 1000;
    private static final int MFCC_FILTER_THRESHOLD = 300;
    private static final int FEATURE_FILTER_THRESHOLD = 200;
    private static final int KEY_TARGET = 1000;
    private static final int MFCC_TARGET = 300;
    private static final int FEATURE_TARGET = 200;

    // ===== 各路候选上限 =====
    private static final int CF_TOP_N = 200;
    private static final int CULTURE_TOP_N = 200;

    // ===== 6 维情感特征等权 =====
    private static final double[] FEATURE_WEIGHTS = {1, 1, 1, 1, 1, 1};

    private final TrackAudioFeatureMapper trackAudioFeatureMapper;
    private final TrackArtistMapper trackArtistMapper;
    private final TrackGenreMapper trackGenreMapper;
    private final TrackMapper trackMapper;
    private final AlbumMapper albumMapper;
    private final ArtistMapper artistMapper;
    private final TrackAudioResourceMapper trackAudioResourceMapper;
    private final StringRedisTemplate stringRedisTemplate;
    private final ObjectMapper objectMapper;

    public TrackRecommendServiceImpl(TrackAudioFeatureMapper trackAudioFeatureMapper,
                                     TrackArtistMapper trackArtistMapper,
                                     TrackGenreMapper trackGenreMapper,
                                     TrackMapper trackMapper,
                                     AlbumMapper albumMapper,
                                     ArtistMapper artistMapper,
                                     TrackAudioResourceMapper trackAudioResourceMapper,
                                     StringRedisTemplate stringRedisTemplate,
                                     ObjectMapper objectMapper) {
        this.trackAudioFeatureMapper = trackAudioFeatureMapper;
        this.trackArtistMapper = trackArtistMapper;
        this.trackGenreMapper = trackGenreMapper;
        this.trackMapper = trackMapper;
        this.albumMapper = albumMapper;
        this.artistMapper = artistMapper;
        this.trackAudioResourceMapper = trackAudioResourceMapper;
        this.stringRedisTemplate = stringRedisTemplate;
        this.objectMapper = objectMapper;
    }

    // ======================== 公共入口 ========================

    @Override
    public void computeAndSaveRecommendations(Long userId, Long trackId) {
        long startTime = System.currentTimeMillis();
        log.info("[推荐] 开始计算 userId={}, trackId={}", userId, trackId);

        // 获取有效歌曲集合
        Set<Long> activeTrackIds = trackMapper.selectList(
                new LambdaQueryWrapper<Track>()
                        .eq(Track::getStatus, 0)
                        .select(Track::getId)
        ).stream().map(Track::getId).collect(Collectors.toSet());

        if (!activeTrackIds.contains(trackId)) {
            log.warn("[推荐] trackId={} 不在有效歌曲中，跳过", trackId);
            return;
        }

        // 三路并行
        CompletableFuture<Map<Long, Double>> contentFuture = CompletableFuture
                .supplyAsync(() -> computeContentBased(trackId, activeTrackIds))
                .exceptionally(e -> { log.error("[推荐] 内容相似计算失败 trackId={}", trackId, e); return Map.of(); });

        CompletableFuture<Map<Long, Double>> cfFuture = CompletableFuture
                .supplyAsync(() -> computeCfBased(trackId))
                .exceptionally(e -> { log.error("[推荐] CF相似读取失败 trackId={}", trackId, e); return Map.of(); });

        CompletableFuture<Map<Long, Double>> cultureFuture = CompletableFuture
                .supplyAsync(() -> computeCultureBased(trackId, activeTrackIds))
                .exceptionally(e -> { log.error("[推荐] 文化相似计算失败 trackId={}", trackId, e); return Map.of(); });

        CompletableFuture.allOf(contentFuture, cfFuture, cultureFuture).join();

        Map<Long, Double> contentScores = contentFuture.join();
        Map<Long, Double> cfScores = cfFuture.join();
        Map<Long, Double> cultureScores = cultureFuture.join();

        log.info("[推荐] 三路完成 userId={}, trackId={} content={} cf={} culture={}",
                userId, trackId, contentScores.size(), cfScores.size(), cultureScores.size());

        Map<Long, Double> finalScores = mergeScores(contentScores, cfScores, cultureScores);
        saveToRedis(userId, trackId, finalScores, contentScores, cfScores, cultureScores);

        log.info("[推荐] 完成 userId={}, trackId={}, 耗时={}ms, 推荐数={}",
                userId, trackId, System.currentTimeMillis() - startTime, finalScores.size());
    }

    @Override
    public List<RecommendTrackVO> getRecommendations(Long userId, Long trackId) {
        long startTime = System.currentTimeMillis();
        String key = buildRecommendKey(userId, trackId);

        // 1. 先尝试从 Redis 读取缓存
        String json = stringRedisTemplate.opsForValue().get(key);
        if (json == null || json.isBlank()) {
            // 缓存未命中，同步计算
            log.info("[推荐] getRecommendations 缓存未命中，同步计算 userId={}, trackId={}", userId, trackId);
            computeAndSaveRecommendations(userId, trackId);
            json = stringRedisTemplate.opsForValue().get(key);
        }

        if (json == null || json.isBlank()) {
            log.warn("[推荐] getRecommendations 无结果 userId={}, trackId={}", userId, trackId);
            return List.of();
        }

        // 2. 解析 Redis 中的推荐数据
        List<Map<String, Object>> redisList;
        try {
            redisList = objectMapper.readValue(json, new TypeReference<List<Map<String, Object>>>() {});
        } catch (Exception e) {
            log.error("[推荐] 解析Redis推荐数据失败 key={}", key, e);
            return List.of();
        }

        if (redisList.isEmpty()) {
            log.warn("[推荐-诊断] Redis 数据为空列表 key={}", key);
            return List.of();
        }

        // 3. 批量查询歌曲完整信息并构建 VO
        List<RecommendTrackVO> result = buildRecommendTrackVOList(redisList);

        long contentCount = result.stream().filter(v -> v.getSources() != null && v.getSources().contains("content")).count();
        long cfCount = result.stream().filter(v -> v.getSources() != null && v.getSources().contains("cf")).count();
        long cultureCount = result.stream().filter(v -> v.getSources() != null && v.getSources().contains("culture")).count();
        log.info("[推荐] getRecommendations userId={}, trackId={}, 耗时={}ms, 返回={}首 (内容={}, 协同={}, 文化={})",
                userId, trackId, System.currentTimeMillis() - startTime, result.size(), contentCount, cfCount, cultureCount);

        return result;
    }

    @Override
    public void deleteRecommendations(Long userId, Long trackId) {
        String key = buildRecommendKey(userId, trackId);
        stringRedisTemplate.delete(key);
        log.info("[推荐] 已删除推荐缓存 userId={}, trackId={}", userId, trackId);
    }

    // ======================== 路径1: 内容相似 ========================

    /**
     * 基于音频特征的内容相似度计算
     * 管线: mode+timesig+tempo(±15%) → key过滤(>1000→1000) → MFCC余弦(≥300→300) → 特征加权(≥200→200)
     */
    private Map<Long, Double> computeContentBased(Long trackId, Set<Long> activeTrackIds) {
        TrackAudioFeature target = trackAudioFeatureMapper.selectById(trackId);
        if (target == null || target.getMusicalMode() == null
                || target.getTimeSignature() == null || target.getTempo() == null) {
            log.warn("[推荐] trackId={} 缺少完整音频特征，跳过内容推荐", trackId);
            return Collections.emptyMap();
        }

        double targetTempo = target.getTempo().doubleValue();
        BigDecimal tempoLow = BigDecimal.valueOf(targetTempo * 0.85);
        BigDecimal tempoHigh = BigDecimal.valueOf(targetTempo * 1.15);

        // 1. 基础过滤: mode + timesig + tempo ±15%
        List<TrackAudioFeature> candidates = trackAudioFeatureMapper.selectList(
                new LambdaQueryWrapper<TrackAudioFeature>()
                        .eq(TrackAudioFeature::getMusicalMode, target.getMusicalMode())
                        .eq(TrackAudioFeature::getTimeSignature, target.getTimeSignature())
                        .ge(TrackAudioFeature::getTempo, tempoLow)
                        .le(TrackAudioFeature::getTempo, tempoHigh)
                        .ne(TrackAudioFeature::getTrackId, trackId)
        );

        // 过滤无效歌曲
        candidates = candidates.stream()
                .filter(f -> activeTrackIds.contains(f.getTrackId()))
                .collect(Collectors.toList());

        if (candidates.isEmpty()) {
            log.info("[推荐] trackId={} 内容推荐无候选", trackId);
            return Collections.emptyMap();
        }

        // 2. Key 过滤: >1000 → 取1000，相邻key优先
        if (candidates.size() > KEY_FILTER_THRESHOLD && target.getMusicalKey() != null) {
            int targetKey = target.getMusicalKey();
            candidates.sort(Comparator.comparingInt(f -> keyDistance(targetKey, f.getMusicalKey())));
            candidates = new ArrayList<>(candidates.subList(0, Math.min(KEY_TARGET, candidates.size())));
        }

        // 3. MFCC 余弦相似度过滤: ≥300 → 取300
        Map<Long, Double> mfccScores = new HashMap<>();
        double[] targetMfcc = parseMfccVector(target.getMfccVector());
        if (candidates.size() >= MFCC_FILTER_THRESHOLD && targetMfcc != null) {
            List<Map.Entry<TrackAudioFeature, Double>> scored = new ArrayList<>();
            for (TrackAudioFeature f : candidates) {
                double[] mfcc = parseMfccVector(f.getMfccVector());
                if (mfcc != null) {
                    scored.add(Map.entry(f, cosineSimilarity(targetMfcc, mfcc)));
                }
            }
            scored.sort((a, b) -> Double.compare(b.getValue(), a.getValue()));
            int limit = Math.min(MFCC_TARGET, scored.size());
            candidates = new ArrayList<>();
            for (int i = 0; i < limit; i++) {
                candidates.add(scored.get(i).getKey());
                mfccScores.put(scored.get(i).getKey().getTrackId(), scored.get(i).getValue());
            }
        }

        // 4. 情感特征加权过滤: ≥200 → 取200
        if (candidates.size() >= FEATURE_FILTER_THRESHOLD) {
            candidates.sort(Comparator.comparingDouble(f -> featureDistance(target, f)));
            candidates = new ArrayList<>(candidates.subList(0, Math.min(FEATURE_TARGET, candidates.size())));
        }

        // 5. 生成最终分数
        Map<Long, Double> scores = new HashMap<>();
        for (TrackAudioFeature f : candidates) {
            double score;
            if (mfccScores.containsKey(f.getTrackId())) {
                score = mfccScores.get(f.getTrackId());
            } else {
                score = 1.0 / (1.0 + featureDistance(target, f));
            }
            scores.put(f.getTrackId(), score);
        }
        return scores;
    }

    // ======================== 路径2: 协同过滤 ========================

    /**
     * 从 Redis 读取 CF 相似度列表，取前 200
     */
    private Map<Long, Double> computeCfBased(Long trackId) {
        String json = stringRedisTemplate.opsForValue().get(CF_REDIS_PREFIX + trackId);
        if (json == null || json.isBlank()) {
            log.info("[推荐] trackId={} 无CF缓存数据", trackId);
            return Collections.emptyMap();
        }
        try {
            List<Map<String, Object>> list = objectMapper.readValue(json,
                    new TypeReference<List<Map<String, Object>>>() {});
            Map<Long, Double> scores = new LinkedHashMap<>();
            int count = 0;
            for (Map<String, Object> item : list) {
                if (count >= CF_TOP_N) break;
                Long tid = parseLongFromMap(item, "targetTrackId");
                Double sim = parseDoubleFromMap(item, "simCf");
                if (tid != null && sim != null) {
                    scores.put(tid, sim);
                    count++;
                }
            }
            for(Map.Entry<Long, Double> a : scores.entrySet()){
                log.info("[协同推荐]:SIM:{}", a.getValue());
            }
            return scores;
        } catch (Exception e) {
            log.error("[推荐] 解析CF缓存失败 trackId={}", trackId, e);
            return Collections.emptyMap();
        }
    }

    // ======================== 路径3: 文化相似 ========================

    /**
     * 基于艺人 + 流派的文化相似度
     * culture_score = 0.6 * 同主要艺人 + 0.3 * 流派重叠率 + 0.1 * 同合作艺人
     */
    private Map<Long, Double> computeCultureBased(Long trackId, Set<Long> activeTrackIds) {
        // 1. 获取目标歌曲的艺人
        List<TrackArtist> targetArtists = trackArtistMapper.selectList(
                new LambdaQueryWrapper<TrackArtist>().eq(TrackArtist::getTrackId, trackId));

        Set<Long> mainArtistIds = targetArtists.stream()
                .filter(ta -> ta.getRole() != null && ta.getRole() == 0)
                .map(TrackArtist::getArtistId)
                .collect(Collectors.toSet());

        Set<Long> featuringArtistIds = targetArtists.stream()
                .filter(ta -> ta.getRole() != null && ta.getRole() == 1)
                .map(TrackArtist::getArtistId)
                .collect(Collectors.toSet());

        // 2. 获取目标歌曲的流派
        Set<Long> targetGenreIds = trackGenreMapper.selectList(
                new LambdaQueryWrapper<TrackGenre>().eq(TrackGenre::getTrackId, trackId))
                .stream().map(TrackGenre::getGenreId).collect(Collectors.toSet());

        Set<Long> allArtistIds = new HashSet<>();
        allArtistIds.addAll(mainArtistIds);
        allArtistIds.addAll(featuringArtistIds);

        if (allArtistIds.isEmpty() && targetGenreIds.isEmpty()) {
            log.info("[推荐] trackId={} 无艺人和流派信息，跳过文化推荐", trackId);
            return Collections.emptyMap();
        }

        // 3. 查询同艺人的其他歌曲
        Map<Long, Set<Long>> candidateArtists = new HashMap<>();
        if (!allArtistIds.isEmpty()) {
            List<TrackArtist> candTrackArtists = trackArtistMapper.selectList(
                    new LambdaQueryWrapper<TrackArtist>()
                            .in(TrackArtist::getArtistId, allArtistIds)
                            .ne(TrackArtist::getTrackId, trackId));
            for (TrackArtist ta : candTrackArtists) {
                if (!activeTrackIds.contains(ta.getTrackId())) continue;
                candidateArtists.computeIfAbsent(ta.getTrackId(), k -> new HashSet<>())
                        .add(ta.getArtistId());
            }
        }

        // 4. 查询同流派的其他歌曲
        Map<Long, Set<Long>> candidateGenres = new HashMap<>();
        if (!targetGenreIds.isEmpty()) {
            List<TrackGenre> candTrackGenres = trackGenreMapper.selectList(
                    new LambdaQueryWrapper<TrackGenre>()
                            .in(TrackGenre::getGenreId, targetGenreIds)
                            .ne(TrackGenre::getTrackId, trackId));
            for (TrackGenre tg : candTrackGenres) {
                if (!activeTrackIds.contains(tg.getTrackId())) continue;
                candidateGenres.computeIfAbsent(tg.getTrackId(), k -> new HashSet<>())
                        .add(tg.getGenreId());
            }
        }

        // 5. 为艺人候选补充流派信息
        Set<Long> needGenreLookup = new HashSet<>(candidateArtists.keySet());
        needGenreLookup.removeAll(candidateGenres.keySet());
        if (!needGenreLookup.isEmpty()) {
            List<TrackGenre> moreGenres = trackGenreMapper.selectList(
                    new LambdaQueryWrapper<TrackGenre>()
                            .in(TrackGenre::getTrackId, needGenreLookup));
            for (TrackGenre tg : moreGenres) {
                candidateGenres.computeIfAbsent(tg.getTrackId(), k -> new HashSet<>())
                        .add(tg.getGenreId());
            }
        }

        // 6. 计算文化分数
        Set<Long> allCandidateIds = new HashSet<>();
        allCandidateIds.addAll(candidateArtists.keySet());
        allCandidateIds.addAll(candidateGenres.keySet());

        Map<Long, Double> scores = new HashMap<>();
        for (Long candId : allCandidateIds) {
            Set<Long> candArtists = candidateArtists.getOrDefault(candId, Set.of());
            Set<Long> candGenres = candidateGenres.getOrDefault(candId, Set.of());

            boolean sameMain = candArtists.stream().anyMatch(mainArtistIds::contains);
            boolean sameFeaturing = candArtists.stream().anyMatch(featuringArtistIds::contains);

            double genreOverlap = 0.0;
            if (!targetGenreIds.isEmpty()) {
                long overlap = candGenres.stream().filter(targetGenreIds::contains).count();
                genreOverlap = (double) overlap / targetGenreIds.size();
            }

            double cultureScore = 0.6 * (sameMain ? 1 : 0)
                    + 0.3 * genreOverlap
                    + 0.1 * (sameFeaturing ? 1 : 0);

            if (cultureScore > 0) {
                scores.put(candId, cultureScore);
            }
        }

        // 取 Top 200
        return scores.entrySet().stream()
                .sorted(Map.Entry.<Long, Double>comparingByValue().reversed())
                .limit(CULTURE_TOP_N)
                .collect(Collectors.toMap(Map.Entry::getKey, Map.Entry::getValue,
                        (a, b) -> a, LinkedHashMap::new));
    }

    // ======================== 融合 + 存储 ========================

    /**
     * 批量查询歌曲信息，构建 RecommendTrackVO 列表
     */
    private List<RecommendTrackVO> buildRecommendTrackVOList(List<Map<String, Object>> redisList) {
        // 1. 收集所有 trackId（兼容 Number 和 String 类型）
        List<Long> trackIds = redisList.stream()
                .map(m -> parseLongFromMap(m, "trackId"))
                .filter(Objects::nonNull)
                .collect(Collectors.toList());

        if (trackIds.isEmpty()) return List.of();

        // 2. 批量查询 tracks
        Map<Long, Track> trackMap = trackMapper.selectBatchIds(trackIds).stream()
                .collect(Collectors.toMap(Track::getId, t -> t, (a, b) -> a));

        // 3. 批量查询 albums
        Set<Long> albumIds = trackMap.values().stream()
                .map(Track::getAlbumId).filter(Objects::nonNull).collect(Collectors.toSet());
        Map<Long, Album> albumMap = albumIds.isEmpty() ? Map.of() :
                albumMapper.selectBatchIds(albumIds).stream()
                        .collect(Collectors.toMap(Album::getId, a -> a, (a, b) -> a));

        // 4. 批量查询 track_artists + artists
        Map<Long, List<ArtistInfoVO>> artistMap = new HashMap<>();
        if (!trackIds.isEmpty()) {
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
        }

        // 5. 批量查询音频资源（取最高码率）
        Map<Long, TrackAudioResource> audioMap = new HashMap<>();
        if (!trackIds.isEmpty()) {
            List<TrackAudioResource> audioResources = trackAudioResourceMapper.selectList(
                    new LambdaQueryWrapper<TrackAudioResource>()
                            .in(TrackAudioResource::getTrackId, trackIds)
                            .orderByDesc(TrackAudioResource::getBitrate));
            for (TrackAudioResource ar : audioResources) {
                audioMap.putIfAbsent(ar.getTrackId(), ar);
            }
        }

        // 6. 组装 RecommendTrackVO
        List<RecommendTrackVO> result = new ArrayList<>();
        for (Map<String, Object> m : redisList) {
            Long tid = parseLongFromMap(m, "trackId");
            if (tid == null) continue;

            Track track = trackMap.get(tid);
            if (track == null) continue; // 歌曲已删除/下架

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

            Object scoreObj = m.get("score");
            if (scoreObj instanceof Number sn) {
                vo.setScore(sn.doubleValue());
            }

            Object sourcesObj = m.get("sources");
            if (sourcesObj instanceof List<?> sl) {
                @SuppressWarnings("unchecked")
                List<String> sources = (List<String>) sl;
                vo.setSources(sources);
            }

            result.add(vo);
        }

        return result;
    }

    /**
     * 三路分数加权融合，取 Top 20
     */
    private Map<Long, Double> mergeScores(Map<Long, Double> content,
                                          Map<Long, Double> cf,
                                          Map<Long, Double> culture) {
        Set<Long> allIds = new HashSet<>();
        allIds.addAll(content.keySet());
        allIds.addAll(cf.keySet());
        allIds.addAll(culture.keySet());

        Map<Long, Double> result = new HashMap<>();
        for (Long tid : allIds) {
            double c = content.getOrDefault(tid, 0.0);
            double f = cf.getOrDefault(tid, 0.0);
            double cu = culture.getOrDefault(tid, 0.0);
            result.put(tid, W_CONTENT * c + W_CF * f + W_CULTURE * cu);
        }

        return result.entrySet().stream()
                .sorted(Map.Entry.<Long, Double>comparingByValue().reversed())
                .limit(FINAL_TOP_N)
                .collect(Collectors.toMap(Map.Entry::getKey, Map.Entry::getValue,
                        (a, b) -> a, LinkedHashMap::new));
    }

    /**
     * 构建用户维度的推荐 Redis key
     */
    private String buildRecommendKey(Long userId, Long trackId) {
        return RECOMMEND_REDIS_PREFIX + userId + ":" + trackId;
    }

    /**
     * 写入 Redis，记录每首歌的主要来源（按三路加权得分最高者判定）
     */
    private void saveToRedis(Long userId, Long trackId, Map<Long, Double> finalScores,
                             Map<Long, Double> content, Map<Long, Double> cf,
                             Map<Long, Double> culture) {
        String key = buildRecommendKey(userId, trackId);
        // 先删除旧推荐数据，再写入新数据
        stringRedisTemplate.delete(key);
        List<Map<String, Object>> valueList = new ArrayList<>();
        for (Map.Entry<Long, Double> entry : finalScores.entrySet()) {
            Long tid = entry.getKey();
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("trackId", tid);
            m.put("score", entry.getValue());

            // 计算三路加权得分，取最大者作为唯一来源
            double contentScore = content.getOrDefault(tid, 0.0) * W_CONTENT;
            double cfScore = cf.getOrDefault(tid, 0.0) * W_CF;
            double cultureScore = culture.getOrDefault(tid, 0.0) * W_CULTURE;

            String source;
            if (contentScore >= cfScore && contentScore >= cultureScore) {
                source = "content";
            } else if (cfScore >= cultureScore) {
                source = "cf";
            } else {
                source = "culture";
            }
            m.put("sources", List.of(source));
            valueList.add(m);
        }
        try {
            String json = objectMapper.writeValueAsString(valueList);
            stringRedisTemplate.opsForValue().set(key, json, RECOMMEND_TTL);
        } catch (Exception e) {
            log.error("[推荐] Redis写入失败 key={}", key, e);
        }
    }

    // ======================== 工具方法 ========================

    /**
     * 从 Map 中解析 Long 值（兼容 Number 和 String 类型）
     */
    private Long parseLongFromMap(Map<String, Object> m, String key) {
        Object val = m.get(key);
        if (val == null) return null;
        if (val instanceof Number n) return n.longValue();
        if (val instanceof String s) {
            try {
                return Long.parseLong(s);
            } catch (NumberFormatException e) {
                log.warn("[推荐] 无法解析 {} 为 Long: {}", key, s);
                return null;
            }
        }
        return null;
    }

    /**
     * 从 Map 中解析 Double 值（兼容 Number 和 String 类型）
     */
    private Double parseDoubleFromMap(Map<String, Object> m, String key) {
        Object val = m.get(key);
        if (val == null) return null;
        if (val instanceof Number n) return n.doubleValue();
        if (val instanceof String s) {
            try {
                return Double.parseDouble(s);
            } catch (NumberFormatException e) {
                log.warn("[推荐] 无法解析 {} 为 Double: {}", key, s);
                return null;
            }
        }
        return null;
    }

    /** 调性距离（chromatic circle，0=相同，6=最远） */
    private int keyDistance(int k1, Integer k2) {
        if (k2 == null) return 12;
        int diff = Math.abs(k1 - k2);
        return Math.min(diff, 12 - diff);
    }

    /** 解析 MFCC JSON 向量为 double[] */
    private double[] parseMfccVector(String json) {
        if (json == null || json.isBlank()) return null;
        try {
            return objectMapper.readValue(json, double[].class);
        } catch (Exception e) {
            return null;
        }
    }

    /** 余弦相似度 */
    private double cosineSimilarity(double[] a, double[] b) {
        if (a == null || b == null || a.length != b.length || a.length == 0) return 0.0;
        double dot = 0, normA = 0, normB = 0;
        for (int i = 0; i < a.length; i++) {
            dot += a[i] * b[i];
            normA += a[i] * a[i];
            normB += b[i] * b[i];
        }
        if (normA == 0 || normB == 0) return 0.0;
        return dot / (Math.sqrt(normA) * Math.sqrt(normB));
    }

    /** 6维情感特征加权欧氏距离 */
    private double featureDistance(TrackAudioFeature a, TrackAudioFeature b) {
        double[] va = {
                bd(a.getValence()), bd(a.getArousal()), bd(a.getEnergy()),
                bd(a.getDanceability()), bd(a.getAcousticness()), bd(a.getInstrumentalness())
        };
        double[] vb = {
                bd(b.getValence()), bd(b.getArousal()), bd(b.getEnergy()),
                bd(b.getDanceability()), bd(b.getAcousticness()), bd(b.getInstrumentalness())
        };
        double sum = 0;
        for (int i = 0; i < FEATURE_WEIGHTS.length; i++) {
            double diff = va[i] - vb[i];
            sum += FEATURE_WEIGHTS[i] * diff * diff;
        }
        return Math.sqrt(sum);
    }

    /** BigDecimal → double */
    private double bd(BigDecimal v) {
        return v != null ? v.doubleValue() : 0.0;
    }
}
