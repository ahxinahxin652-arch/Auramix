package com.son.auramix.service.recommend.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.son.auramix.domain.entity.*;
import com.son.auramix.domain.vo.user.ArtistInfoVO;
import com.son.auramix.domain.vo.user.RecommendTrackVO;
import com.son.auramix.mapper.*;
import com.son.auramix.service.recommend.UserPreferenceService;
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
 * 用户偏好向量 & 每日推荐服务实现
 * <p>
 * 偏好向量计算：
 * <ul>
 *   <li>长期画像：近 90 天正向行为的流派/艺人偏好</li>
 *   <li>短期画像：近 14 天正向行为的流派/艺人偏好</li>
 *   <li>负向画像：跳过/取消收藏的流派/艺人（权重为负）</li>
 * </ul>
 * <p>
 * 每日推荐：基于偏好向量对全量活跃歌曲打分，排除近期已听，取 Top 20。
 * 冷启动用户补充热门歌曲作为探索推荐。
 *
 * @author auramix
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class UserPreferenceServiceImpl implements UserPreferenceService {

    // ===== Redis Key =====
    private static final String PREF_REDIS_PREFIX = "auramix:user:pref:";
    private static final String DAILY_REDIS_PREFIX = "auramix:user:daily:";

    // ===== 时间窗口 =====
    private static final int LONG_TERM_DAYS = 90;
    private static final int SHORT_TERM_DAYS = 14;
    private static final int RECENT_EXCLUDE_DAYS = 14;

    // ===== 每日推荐数量 =====
    private static final int DAILY_COUNT = 20;

    // ===== 行为权重 =====
    private static final double W_FULL_LISTEN = 1.0;
    private static final double W_FAVORITE = 1.0;
    private static final double W_PLAY = 0.7;
    private static final double W_SHARE = 0.8;
    private static final double W_ADD_PLAYLIST = 0.9;
    private static final double W_SKIP = -0.5;
    private static final double W_UNFAVORITE = -1.0;

    // ===== 每日推荐打分权重 =====
    private static final double W_GENRE = 0.5;
    private static final double W_ARTIST = 0.5;

    // ===== 依赖 =====
    private final UserMapper userMapper;
    private final UserBehaviorLogMapper userBehaviorLogMapper;
    private final UserPreferenceVectorMapper userPreferenceVectorMapper;
    private final DailyRecommendationMapper dailyRecommendationMapper;
    private final TrackMapper trackMapper;
    private final TrackGenreMapper trackGenreMapper;
    private final TrackArtistMapper trackArtistMapper;
    private final TrackAudioResourceMapper trackAudioResourceMapper;
    private final AlbumMapper albumMapper;
    private final ArtistMapper artistMapper;
    private final GenreMapper genreMapper;
    private final StringRedisTemplate stringRedisTemplate;
    private final ObjectMapper objectMapper;

    // ======================== 全量计算（定时任务入口） ========================

    @Override
    public void computeAll() {
        log.info("[用户偏好] 开始全量计算");
        long startTime = System.currentTimeMillis();

        // 1. 预加载共享数据
        List<Track> activeTracks = trackMapper.selectList(
                new LambdaQueryWrapper<Track>().eq(Track::getStatus, 0));
        Set<Long> activeTrackIds = activeTracks.stream().map(Track::getId).collect(Collectors.toSet());

        Map<Long, Set<Long>> trackGenreMap = loadTrackGenres(activeTrackIds);
        Map<Long, Set<Long>> trackArtistMap = loadTrackArtists(activeTrackIds);
        Map<Long, String> genreNames = genreMapper.selectList(null).stream()
                .collect(Collectors.toMap(Genre::getId, Genre::getName, (a, b) -> a));
        Map<Long, String> artistNames = artistMapper.selectList(null).stream()
                .collect(Collectors.toMap(Artist::getId, Artist::getName, (a, b) -> a));

        // 2. 获取所有用户
        List<Long> userIds = userMapper.selectList(null).stream()
                .map(User::getId).collect(Collectors.toList());

        log.info("[用户偏好] 活跃歌曲={}首, 用户={}个", activeTracks.size(), userIds.size());

        // 3. 逐用户计算
        LocalDate today = LocalDate.now();
        int success = 0, fail = 0;
        for (Long userId : userIds) {
            try {
                computeForUser(userId, activeTracks, trackGenreMap, trackArtistMap,
                        genreNames, artistNames, today);
                success++;
            } catch (Exception e) {
                log.error("[用户偏好] 计算失败 userId={}", userId, e);
                fail++;
            }
        }

        log.info("[用户偏好] 全量计算完成, 成功={}, 失败={}, 耗时={}ms",
                success, fail, System.currentTimeMillis() - startTime);
    }

    /**
     * 计算单个用户的偏好向量 + 每日推荐
     */
    private void computeForUser(Long userId, List<Track> activeTracks,
                                 Map<Long, Set<Long>> trackGenreMap,
                                 Map<Long, Set<Long>> trackArtistMap,
                                 Map<Long, String> genreNames,
                                 Map<Long, String> artistNames,
                                 LocalDate today) {
        // 1. 查询全部行为日志
        List<UserBehaviorLog> allLogs = userBehaviorLogMapper.selectList(
                new LambdaQueryWrapper<UserBehaviorLog>().eq(UserBehaviorLog::getUserId, userId));

        // 2. 计算偏好向量
        UserPreferenceVector vector = computePreferenceVector(userId, allLogs);
        savePreferenceVector(vector);

        // 3. 生成每日推荐
        generateDailyRecommendations(userId, vector, activeTracks, trackGenreMap,
                trackArtistMap, genreNames, artistNames, today);
    }

    // ======================== 偏好向量计算 ========================

    /**
     * 从行为日志计算用户偏好向量
     */
    private UserPreferenceVector computePreferenceVector(Long userId, List<UserBehaviorLog> allLogs) {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime longTermStart = now.minusDays(LONG_TERM_DAYS);
        LocalDateTime shortTermStart = now.minusDays(SHORT_TERM_DAYS);

        // 按时间窗口和行为类型拆分
        List<UserBehaviorLog> longTermPositive = allLogs.stream()
                .filter(l -> l.getCreatedAt() != null && l.getCreatedAt().isAfter(longTermStart))
                .filter(this::isPositiveBehavior)
                .collect(Collectors.toList());

        List<UserBehaviorLog> shortTermPositive = allLogs.stream()
                .filter(l -> l.getCreatedAt() != null && l.getCreatedAt().isAfter(shortTermStart))
                .filter(this::isPositiveBehavior)
                .collect(Collectors.toList());

        List<UserBehaviorLog> negativeLogs = allLogs.stream()
                .filter(this::isNegativeBehavior)
                .collect(Collectors.toList());

        // 计算流派/艺人偏好
        Map<String, Double> longTermGenre = computeGenrePreferences(longTermPositive);
        Map<String, Double> longTermArtist = computeArtistPreferences(longTermPositive);
        Map<String, Double> shortTermGenre = computeGenrePreferences(shortTermPositive);
        Map<String, Double> shortTermArtist = computeArtistPreferences(shortTermPositive);
        Map<String, Double> negativeGenre = computeGenrePreferences(negativeLogs);
        Map<String, Double> negativeArtist = computeArtistPreferences(negativeLogs);

        // 统计元数据
        int totalPlayCount = (int) allLogs.stream()
                .filter(l -> l.getBehaviorType() != null
                        && l.getBehaviorType() == UserBehaviorLog.BEHAVIOR_PLAY)
                .count();
        int activeDays = (int) allLogs.stream()
                .filter(l -> l.getCreatedAt() != null && l.getCreatedAt().isAfter(now.minusDays(30)))
                .map(l -> l.getCreatedAt().toLocalDate())
                .distinct()
                .count();

        double confidence = Math.min(1.0, allLogs.size() / 100.0);
        // 活跃天数越多，长期画像权重越高
        double fusionRatio = Math.min(0.8, 0.4 + activeDays * 0.04);

        // 构建实体
        UserPreferenceVector vector = new UserPreferenceVector();
        vector.setUserId(userId);
        vector.setTotalPlayCount(totalPlayCount);
        vector.setActiveDays(activeDays);
        vector.setConfidenceScore(BigDecimal.valueOf(confidence));
        vector.setFusionRatio(BigDecimal.valueOf(fusionRatio));

        vector.setLongTermGenre(toJson(longTermGenre));
        vector.setLongTermArtist(toJson(longTermArtist));
        vector.setLongTermEmotion("{}");
        vector.setLongTermScene("{}");
        vector.setLongTermUpdatedAt(now);

        vector.setShortTermGenre(toJson(shortTermGenre));
        vector.setShortTermArtist(toJson(shortTermArtist));
        vector.setShortTermEmotion("{}");
        vector.setShortTermScene("{}");
        vector.setShortTermUpdatedAt(now);

        vector.setNegativeGenre(toJson(negativeGenre));
        vector.setNegativeArtist(toJson(negativeArtist));
        vector.setNegativeUpdatedAt(now);

        vector.setProfileVersion(2);
        vector.setCalculatedAt(now);
        vector.setDataSnapshot(String.format(
                "{\"totalLogs\":%d,\"longTermPositive\":%d,\"shortTermPositive\":%d,\"negative\":%d}",
                allLogs.size(), longTermPositive.size(), shortTermPositive.size(), negativeLogs.size()));

        return vector;
    }

    /**
     * 计算流派偏好 Map {genreId: weight}
     */
    private Map<String, Double> computeGenrePreferences(List<UserBehaviorLog> logs) {
        Map<String, Double> scores = new HashMap<>();
        Set<Long> trackIds = logs.stream()
                .map(UserBehaviorLog::getTrackId)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());
        if (trackIds.isEmpty()) return scores;

        // 查询 track -> genres
        List<TrackGenre> trackGenres = trackGenreMapper.selectList(
                new LambdaQueryWrapper<TrackGenre>().in(TrackGenre::getTrackId, trackIds));
        Map<Long, Set<Long>> map = new HashMap<>();
        for (TrackGenre tg : trackGenres) {
            map.computeIfAbsent(tg.getTrackId(), k -> new HashSet<>()).add(tg.getGenreId());
        }

        // 累加权重
        for (UserBehaviorLog log : logs) {
            if (log.getTrackId() == null || log.getBehaviorType() == null) continue;
            double weight = getBehaviorWeight(log);
            if (weight == 0) continue;
            Set<Long> genreIds = map.getOrDefault(log.getTrackId(), Set.of());
            for (Long genreId : genreIds) {
                scores.merge(genreId.toString(), weight, Double::sum);
            }
        }

        normalize(scores);
        return scores;
    }

    /**
     * 计算艺人偏好 Map {artistId: weight}
     */
    private Map<String, Double> computeArtistPreferences(List<UserBehaviorLog> logs) {
        Map<String, Double> scores = new HashMap<>();
        Set<Long> trackIds = logs.stream()
                .map(UserBehaviorLog::getTrackId)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());
        if (trackIds.isEmpty()) return scores;

        List<TrackArtist> trackArtists = trackArtistMapper.selectList(
                new LambdaQueryWrapper<TrackArtist>().in(TrackArtist::getTrackId, trackIds));
        Map<Long, Set<Long>> map = new HashMap<>();
        for (TrackArtist ta : trackArtists) {
            map.computeIfAbsent(ta.getTrackId(), k -> new HashSet<>()).add(ta.getArtistId());
        }

        for (UserBehaviorLog log : logs) {
            if (log.getTrackId() == null || log.getBehaviorType() == null) continue;
            double weight = getBehaviorWeight(log);
            if (weight == 0) continue;
            Set<Long> artistIds = map.getOrDefault(log.getTrackId(), Set.of());
            for (Long artistId : artistIds) {
                scores.merge(artistId.toString(), weight, Double::sum);
            }
        }

        normalize(scores);
        return scores;
    }

    // ======================== 每日推荐生成 ========================

    /**
     * 基于偏好向量为用户生成每日推荐，写入 daily_recommendations 表
     */
    private void generateDailyRecommendations(Long userId, UserPreferenceVector vector,
                                               List<Track> activeTracks,
                                               Map<Long, Set<Long>> trackGenreMap,
                                               Map<Long, Set<Long>> trackArtistMap,
                                               Map<Long, String> genreNames,
                                               Map<Long, String> artistNames,
                                               LocalDate today) {
        // 1. 解析偏好
        Map<String, Double> longTermGenre = fromJson(vector.getLongTermGenre());
        Map<String, Double> longTermArtist = fromJson(vector.getLongTermArtist());
        Map<String, Double> shortTermGenre = fromJson(vector.getShortTermGenre());
        Map<String, Double> shortTermArtist = fromJson(vector.getShortTermArtist());
        Map<String, Double> negativeGenre = fromJson(vector.getNegativeGenre());
        Map<String, Double> negativeArtist = fromJson(vector.getNegativeArtist());
        double fusionRatio = vector.getFusionRatio() != null ? vector.getFusionRatio().doubleValue() : 0.5;

        // 2. 排除近期已交互歌曲
        Set<Long> recentTrackIds = getRecentTrackIds(userId, RECENT_EXCLUDE_DAYS);

        // 3. 对每首歌打分
        List<TrackScore> scores = new ArrayList<>();
        for (Track track : activeTracks) {
            if (recentTrackIds.contains(track.getId())) continue;

            Set<Long> genres = trackGenreMap.getOrDefault(track.getId(), Set.of());
            Set<Long> artists = trackArtistMap.getOrDefault(track.getId(), Set.of());

            double genreScore = computeMatchScore(genres, longTermGenre, shortTermGenre, fusionRatio);
            double artistScore = computeMatchScore(artists, longTermArtist, shortTermArtist, fusionRatio);
            double penalty = computeNegativePenalty(genres, artists, negativeGenre, negativeArtist);

            double finalScore = W_GENRE * genreScore + W_ARTIST * artistScore - penalty;
            if (finalScore > 0) {
                int source = determineSource(genreScore, artistScore, fusionRatio);
                String reasonTag = buildReasonTag(genres, artists, longTermGenre, longTermArtist,
                        shortTermGenre, shortTermArtist, genreNames, artistNames, fusionRatio);
                scores.add(new TrackScore(track.getId(), finalScore, source, reasonTag));
            }
        }

        // 4. 冷启动补充：偏好推荐不足 20 首时，用热门歌曲补齐
        if (scores.size() < DAILY_COUNT) {
            Set<Long> scoredIds = scores.stream().map(s -> s.trackId).collect(Collectors.toSet());
            List<Track> popular = activeTracks.stream()
                    .filter(t -> !scoredIds.contains(t.getId()))
                    .filter(t -> !recentTrackIds.contains(t.getId()))
                    .sorted(Comparator.comparing(Track::getPlayCount,
                            Comparator.nullsLast(Comparator.reverseOrder())))
                    .limit(DAILY_COUNT - scores.size())
                    .collect(Collectors.toList());
            for (Track t : popular) {
                scores.add(new TrackScore(t.getId(), 0.1, DailyRecommendation.SOURCE_EXPLORE, "热门探索"));
            }
        }

        // 5. 排序取 Top 20
        scores.sort((a, b) -> Double.compare(b.score, a.score));
        List<TrackScore> topN = scores.subList(0, Math.min(DAILY_COUNT, scores.size()));

        // 6. 删除今日偏好推荐旧记录（只删 source=0,1,2，保留探索发现 source=3），批量插入新记录
        dailyRecommendationMapper.delete(
                new LambdaQueryWrapper<DailyRecommendation>()
                        .eq(DailyRecommendation::getUserId, userId)
                        .eq(DailyRecommendation::getRecommendDate, today)
                        .in(DailyRecommendation::getSource,
                                DailyRecommendation.SOURCE_LONG_TERM,
                                DailyRecommendation.SOURCE_SHORT_TERM,
                                DailyRecommendation.SOURCE_EXPLORE));

        List<DailyRecommendation> recs = new ArrayList<>();
        for (int i = 0; i < topN.size(); i++) {
            TrackScore ts = topN.get(i);
            DailyRecommendation rec = new DailyRecommendation();
            rec.setUserId(userId);
            rec.setTrackId(ts.trackId);
            rec.setRecommendDate(today);
            rec.setRank(i + 1);
            rec.setReasonTag(ts.reasonTag);
            rec.setSource(ts.source);
            recs.add(rec);
        }
        if (!recs.isEmpty()) {
            dailyRecommendationMapper.batchInsert(recs);
        }

        log.info("[用户偏好] 每日推荐生成 userId={}, 推荐={}首 (偏好={}, 探索={})",
                userId, recs.size(),
                recs.stream().filter(r -> r.getSource() != DailyRecommendation.SOURCE_EXPLORE).count(),
                recs.stream().filter(r -> r.getSource() == DailyRecommendation.SOURCE_EXPLORE).count());
    }

    /**
     * 计算歌曲与用户偏好的匹配分数
     */
    private double computeMatchScore(Set<Long> ids, Map<String, Double> longTermPref,
                                      Map<String, Double> shortTermPref, double fusionRatio) {
        if (ids.isEmpty() || (longTermPref.isEmpty() && shortTermPref.isEmpty())) return 0.0;

        double longScore = 0.0;
        double shortScore = 0.0;
        int longCount = 0;
        int shortCount = 0;

        for (Long id : ids) {
            String key = id.toString();
            if (longTermPref.containsKey(key)) {
                longScore += longTermPref.get(key);
                longCount++;
            }
            if (shortTermPref.containsKey(key)) {
                shortScore += shortTermPref.get(key);
                shortCount++;
            }
        }

        if (longCount > 0) longScore /= longCount;
        if (shortCount > 0) shortScore /= shortCount;

        return fusionRatio * longScore + (1 - fusionRatio) * shortScore;
    }

    /**
     * 计算负向偏好惩罚
     */
    private double computeNegativePenalty(Set<Long> genres, Set<Long> artists,
                                           Map<String, Double> negativeGenre,
                                           Map<String, Double> negativeArtist) {
        double penalty = 0.0;
        for (Long genreId : genres) {
            String key = genreId.toString();
            if (negativeGenre.containsKey(key)) {
                penalty = Math.max(penalty, Math.abs(negativeGenre.get(key)));
            }
        }
        for (Long artistId : artists) {
            String key = artistId.toString();
            if (negativeArtist.containsKey(key)) {
                penalty = Math.max(penalty, Math.abs(negativeArtist.get(key)));
            }
        }
        return penalty;
    }

    /**
     * 判定推荐来源
     */
    private int determineSource(double genreScore, double artistScore, double fusionRatio) {
        // 短期权重较高时判定为短期兴趣，否则长期偏好
        if ((1 - fusionRatio) > 0.4) {
            return DailyRecommendation.SOURCE_SHORT_TERM;
        }
        return DailyRecommendation.SOURCE_LONG_TERM;
    }

    /**
     * 构建推荐理由标签
     */
    private String buildReasonTag(Set<Long> genres, Set<Long> artists,
                                   Map<String, Double> longTermGenre, Map<String, Double> longTermArtist,
                                   Map<String, Double> shortTermGenre, Map<String, Double> shortTermArtist,
                                   Map<Long, String> genreNames, Map<Long, String> artistNames,
                                   double fusionRatio) {
        // 找出权重最高的艺人
        String topArtist = findTopMatch(artists, longTermArtist, shortTermArtist, artistNames, fusionRatio);
        if (topArtist != null) {
            return "因为你喜欢 " + topArtist;
        }
        // 找出权重最高的流派
        String topGenre = findTopMatch(genres, longTermGenre, shortTermGenre, genreNames, fusionRatio);
        if (topGenre != null) {
            return "基于你喜欢的" + topGenre;
        }
        return "为你推荐";
    }

    /**
     * 在歌曲的 genres/artists 中找到用户偏好权重最高的匹配项名称
     */
    private String findTopMatch(Set<Long> ids, Map<String, Double> longTermPref,
                                 Map<String, Double> shortTermPref, Map<Long, String> nameMap,
                                 double fusionRatio) {
        String bestName = null;
        double bestScore = 0.0;
        for (Long id : ids) {
            String key = id.toString();
            double longVal = longTermPref.getOrDefault(key, 0.0);
            double shortVal = shortTermPref.getOrDefault(key, 0.0);
            double score = fusionRatio * longVal + (1 - fusionRatio) * shortVal;
            if (score > bestScore) {
                bestScore = score;
                bestName = nameMap.get(id);
            }
        }
        return bestName;
    }

    // ======================== Redis 缓存（登录触发） ========================

    @Override
    public void cacheOnLogin(Long userId) {
        try {
            Duration ttl = ttlUntilMidnight();

            // 1. 缓存偏好向量
            UserPreferenceVector vector = userPreferenceVectorMapper.selectById(userId);
            if (vector != null) {
                stringRedisTemplate.opsForValue()
                        .set(PREF_REDIS_PREFIX + userId, objectMapper.writeValueAsString(vector), ttl);
            }

            // 2. 缓存每日推荐（只取 source=0,1,2，排除探索发现 source=3）
            LocalDate today = LocalDate.now();
            List<DailyRecommendation> recs = dailyRecommendationMapper.selectList(
                    new LambdaQueryWrapper<DailyRecommendation>()
                            .eq(DailyRecommendation::getUserId, userId)
                            .eq(DailyRecommendation::getRecommendDate, today)
                            .in(DailyRecommendation::getSource,
                                    DailyRecommendation.SOURCE_LONG_TERM,
                                    DailyRecommendation.SOURCE_SHORT_TERM,
                                    DailyRecommendation.SOURCE_EXPLORE)
                            .orderByAsc(DailyRecommendation::getRank));

            if (!recs.isEmpty()) {
                List<Map<String, Object>> dailyList = new ArrayList<>();
                for (DailyRecommendation rec : recs) {
                    Map<String, Object> m = new LinkedHashMap<>();
                    m.put("trackId", rec.getTrackId());
                    m.put("rank", rec.getRank());
                    m.put("source", rec.getSource());
                    m.put("reasonTag", rec.getReasonTag());
                    dailyList.add(m);
                }
                stringRedisTemplate.opsForValue()
                        .set(DAILY_REDIS_PREFIX + userId, objectMapper.writeValueAsString(dailyList), ttl);
            }

            log.info("[用户偏好] 登录缓存完成 userId={}, 有偏好向量={}, 每日推荐={}首",
                    userId, vector != null, recs.size());
        } catch (Exception e) {
            log.warn("[用户偏好] 登录缓存失败 userId={}", userId, e);
        }
    }

    @Override
    public UserPreferenceVector getUserPreferenceVector(Long userId) {
        String key = PREF_REDIS_PREFIX + userId;
        String json = stringRedisTemplate.opsForValue().get(key);

        if (json != null && !json.isBlank()) {
            try {
                return objectMapper.readValue(json, UserPreferenceVector.class);
            } catch (Exception e) {
                log.warn("[用户偏好] Redis解析失败 userId={}, 回退DB", userId);
            }
        }

        // Redis 未命中或过期 → 从 DB 加载并重新缓存
        UserPreferenceVector vector = userPreferenceVectorMapper.selectById(userId);
        if (vector != null) {
            try {
                stringRedisTemplate.opsForValue()
                        .set(key, objectMapper.writeValueAsString(vector), ttlUntilMidnight());
            } catch (Exception e) {
                log.warn("[用户偏好] 重新缓存失败 userId={}", userId);
            }
        }
        return vector;
    }

    @Override
    public List<RecommendTrackVO> getDailyRecommendations(Long userId) {
        String key = DAILY_REDIS_PREFIX + userId;
        String json = stringRedisTemplate.opsForValue().get(key);

        List<Map<String, Object>> dailyList = null;

        if (json != null && !json.isBlank()) {
            // Redis 命中
            try {
                dailyList = objectMapper.readValue(json, new TypeReference<List<Map<String, Object>>>() {});
            } catch (Exception e) {
                log.warn("[每日推荐] Redis解析失败 userId={}, 回退DB", userId);
            }
        }

        if (dailyList == null) {
            // Redis 未命中或过期 → 从 DB 加载并重新缓存（只取 source=0,1,2）
            LocalDate today = LocalDate.now();
            List<DailyRecommendation> recs = dailyRecommendationMapper.selectList(
                    new LambdaQueryWrapper<DailyRecommendation>()
                            .eq(DailyRecommendation::getUserId, userId)
                            .eq(DailyRecommendation::getRecommendDate, today)
                            .in(DailyRecommendation::getSource,
                                    DailyRecommendation.SOURCE_LONG_TERM,
                                    DailyRecommendation.SOURCE_SHORT_TERM,
                                    DailyRecommendation.SOURCE_EXPLORE)
                            .orderByAsc(DailyRecommendation::getRank));

            if (recs.isEmpty()) {
                log.info("[每日推荐] 无推荐数据 userId={}", userId);
                return List.of();
            }

            // 转为 Map 列表并重新缓存
            dailyList = new ArrayList<>();
            for (DailyRecommendation rec : recs) {
                Map<String, Object> m = new LinkedHashMap<>();
                m.put("trackId", rec.getTrackId());
                m.put("rank", rec.getRank());
                m.put("source", rec.getSource());
                m.put("reasonTag", rec.getReasonTag());
                dailyList.add(m);
            }
            try {
                stringRedisTemplate.opsForValue()
                        .set(key, objectMapper.writeValueAsString(dailyList), ttlUntilMidnight());
                log.info("[每日推荐] Redis过期, 从DB重新缓存 userId={} count={}", userId, dailyList.size());
            } catch (Exception e) {
                log.warn("[每日推荐] 重新缓存失败 userId={}", userId);
            }
        }

        // 构建 VO
        return buildDailyVOs(dailyList);
    }

    // ======================== VO 构建 ========================

    /**
     * 从推荐列表构建含播放信息的 VO
     */
    private List<RecommendTrackVO> buildDailyVOs(List<Map<String, Object>> dailyList) {
        List<Long> trackIds = dailyList.stream()
                .map(m -> parseLong(m, "trackId"))
                .filter(Objects::nonNull)
                .collect(Collectors.toList());
        if (trackIds.isEmpty()) return List.of();

        // 批量查询歌曲
        Map<Long, Track> trackMap = trackMapper.selectBatchIds(trackIds).stream()
                .collect(Collectors.toMap(Track::getId, t -> t, (a, b) -> a));

        // 批量查询专辑
        Set<Long> albumIds = trackMap.values().stream()
                .map(Track::getAlbumId).filter(Objects::nonNull).collect(Collectors.toSet());
        Map<Long, Album> albumMap = albumIds.isEmpty() ? Map.of() :
                albumMapper.selectBatchIds(albumIds).stream()
                        .collect(Collectors.toMap(Album::getId, a -> a, (a, b) -> a));

        // 批量查询艺人
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

        // 批量查询音频资源（取最高码率）
        Map<Long, TrackAudioResource> audioMap = new HashMap<>();
        List<TrackAudioResource> audioResources = trackAudioResourceMapper.selectList(
                new LambdaQueryWrapper<TrackAudioResource>()
                        .in(TrackAudioResource::getTrackId, trackIds)
                        .orderByDesc(TrackAudioResource::getBitrate));
        for (TrackAudioResource ar : audioResources) {
            audioMap.putIfAbsent(ar.getTrackId(), ar);
        }

        // 组装 VO
        List<RecommendTrackVO> result = new ArrayList<>();
        for (Map<String, Object> m : dailyList) {
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

            // rank 转换为相对分数（1/rank）
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
     * 保存偏好向量（upsert）
     */
    private void savePreferenceVector(UserPreferenceVector vector) {
        UserPreferenceVector existing = userPreferenceVectorMapper.selectById(vector.getUserId());
        if (existing == null) {
            userPreferenceVectorMapper.insert(vector);
        } else {
            userPreferenceVectorMapper.updateById(vector);
        }
    }

    /**
     * 获取用户近期已交互的歌曲 ID（排除重复推荐）
     */
    private Set<Long> getRecentTrackIds(Long userId, int days) {
        LocalDateTime since = LocalDateTime.now().minusDays(days);
        List<UserBehaviorLog> recentLogs = userBehaviorLogMapper.selectList(
                new LambdaQueryWrapper<UserBehaviorLog>()
                        .eq(UserBehaviorLog::getUserId, userId)
                        .ge(UserBehaviorLog::getCreatedAt, since));
        return recentLogs.stream()
                .map(UserBehaviorLog::getTrackId)
                .filter(Objects::nonNull)
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
     * 批量加载 track -> artistIds 映射
     */
    private Map<Long, Set<Long>> loadTrackArtists(Set<Long> trackIds) {
        Map<Long, Set<Long>> map = new HashMap<>();
        if (trackIds.isEmpty()) return map;
        List<TrackArtist> list = trackArtistMapper.selectList(
                new LambdaQueryWrapper<TrackArtist>().in(TrackArtist::getTrackId, trackIds));
        for (TrackArtist ta : list) {
            map.computeIfAbsent(ta.getTrackId(), k -> new HashSet<>()).add(ta.getArtistId());
        }
        return map;
    }

    /**
     * 判断是否为正向行为
     */
    private boolean isPositiveBehavior(UserBehaviorLog log) {
        if (log.getBehaviorType() == null) return false;
        int type = log.getBehaviorType();
        if (type == UserBehaviorLog.BEHAVIOR_SKIP || type == UserBehaviorLog.BEHAVIOR_UNFAVORITE) return false;
        if (type == UserBehaviorLog.BEHAVIOR_PLAY) {
            return log.getBehaviorDuration() != null && log.getBehaviorDuration() >= 120;
        }
        return type == UserBehaviorLog.BEHAVIOR_FULL_LISTEN
                || type == UserBehaviorLog.BEHAVIOR_FAVORITE
                || type == UserBehaviorLog.BEHAVIOR_SHARE
                || type == UserBehaviorLog.BEHAVIOR_ADD_TO_PLAYLIST;
    }

    /**
     * 判断是否为负向行为
     */
    private boolean isNegativeBehavior(UserBehaviorLog log) {
        if (log.getBehaviorType() == null) return false;
        int type = log.getBehaviorType();
        return type == UserBehaviorLog.BEHAVIOR_SKIP || type == UserBehaviorLog.BEHAVIOR_UNFAVORITE;
    }

    /**
     * 获取行为权重
     */
    private double getBehaviorWeight(UserBehaviorLog log) {
        if (log.getBehaviorType() == null) return 0;
        switch (log.getBehaviorType()) {
            case UserBehaviorLog.BEHAVIOR_FULL_LISTEN: return W_FULL_LISTEN;
            case UserBehaviorLog.BEHAVIOR_FAVORITE: return W_FAVORITE;
            case UserBehaviorLog.BEHAVIOR_PLAY:
                return (log.getBehaviorDuration() != null && log.getBehaviorDuration() >= 120)
                        ? W_PLAY : 0.0;
            case UserBehaviorLog.BEHAVIOR_SHARE: return W_SHARE;
            case UserBehaviorLog.BEHAVIOR_ADD_TO_PLAYLIST: return W_ADD_PLAYLIST;
            case UserBehaviorLog.BEHAVIOR_SKIP: return W_SKIP;
            case UserBehaviorLog.BEHAVIOR_UNFAVORITE: return W_UNFAVORITE;
            default: return 0;
        }
    }

    /**
     * 归一化到 [-1, 1]
     */
    private void normalize(Map<String, Double> scores) {
        if (scores.isEmpty()) return;
        double max = scores.values().stream().mapToDouble(Math::abs).max().orElse(1.0);
        if (max > 0) {
            scores.replaceAll((k, v) -> v / max);
        }
    }

    /**
     * Map → JSON
     */
    private String toJson(Map<String, Double> map) {
        if (map == null || map.isEmpty()) return "{}";
        try {
            return objectMapper.writeValueAsString(map);
        } catch (Exception e) {
            return "{}";
        }
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

    /**
     * 从 Map 解析 Long
     */
    private Long parseLong(Map<String, Object> m, String key) {
        Object val = m.get(key);
        if (val == null) return null;
        if (val instanceof Number n) return n.longValue();
        if (val instanceof String s) {
            try { return Long.parseLong(s); } catch (NumberFormatException e) { return null; }
        }
        return null;
    }

    /**
     * 从 Map 解析 Integer
     */
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
     * 歌曲打分结果
     */
    private static class TrackScore {
        final Long trackId;
        final double score;
        final int source;
        final String reasonTag;

        TrackScore(Long trackId, double score, int source, String reasonTag) {
            this.trackId = trackId;
            this.score = score;
            this.source = source;
            this.reasonTag = reasonTag;
        }
    }
}
