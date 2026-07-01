package com.son.auramix.service.recommend.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.son.auramix.domain.entity.CfSimilarityTopn;
import com.son.auramix.domain.entity.Track;
import com.son.auramix.domain.entity.UserBehaviorLog;
import com.son.auramix.mapper.CfSimilarityTopnMapper;
import com.son.auramix.mapper.TrackMapper;
import com.son.auramix.mapper.UserBehaviorLogMapper;
import com.son.auramix.service.recommend.CfSimilarityService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

/**
 * 协同过滤相似度离线计算服务实现
 * <p>
 * 算法：
 * 1. 从 user_behavior_logs 提取正反馈（behaviorType=0 播放 且 behaviorDuration ≥ 30 秒）
 * 2. 计算歌曲间共现次数 co_occurrence(i,j) = 同时喜欢 i 和 j 的用户数
 * 3. 计算余弦相似度 sim(i,j) = |Ui ∩ Uj| / sqrt(|Ui| · |Uj|)
 * 4. 每首歌保留 TopN 200，写入 cf_similarity_topn 表 + Redis
 *
 * @author auramix
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class CfSimilarityServiceImpl implements CfSimilarityService {

    private static final int TOP_N = 200;
    private static final int MIN_PLAY_DURATION = 30;
    private static final String REDIS_KEY_PREFIX = "auramix:cf:similar:";
    private static final int BATCH_SIZE = 1000;

    private final UserBehaviorLogMapper userBehaviorLogMapper;
    private final CfSimilarityTopnMapper cfSimilarityTopnMapper;
    private final TrackMapper trackMapper;
    private final StringRedisTemplate stringRedisTemplate;
    private final ObjectMapper objectMapper;

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void computeAndSave() {
        long startTime = System.currentTimeMillis();
        log.info("[CF相似度] 开始离线计算");

        // ============ 1. 提取正反馈数据 ============
        List<UserBehaviorLog> positiveLogs = userBehaviorLogMapper.selectList(
                new LambdaQueryWrapper<UserBehaviorLog>()
                        .eq(UserBehaviorLog::getBehaviorType, UserBehaviorLog.BEHAVIOR_PLAY)
                        .ge(UserBehaviorLog::getBehaviorDuration, MIN_PLAY_DURATION)
                        .select(UserBehaviorLog::getUserId, UserBehaviorLog::getTrackId)
        );
        log.info("[CF相似度] 正反馈记录数: {}", positiveLogs.size());

        if (positiveLogs.isEmpty()) {
            log.info("[CF相似度] 无正反馈数据，清空旧数据后结束");
            cfSimilarityTopnMapper.delete(new LambdaQueryWrapper<>());
            clearRedisKeys();
            return;
        }

        // ============ 2. 构建 用户->歌曲集合 & 歌曲->用户集合 ============
        Map<Long, Set<Long>> userTracks = new HashMap<>();
        Map<Long, Set<Long>> trackUsers = new HashMap<>();
        for (UserBehaviorLog log : positiveLogs) {
            if (log.getUserId() == null || log.getTrackId() == null) {
                continue;
            }
            userTracks.computeIfAbsent(log.getUserId(), k -> new HashSet<>())
                      .add(log.getTrackId());
            trackUsers.computeIfAbsent(log.getTrackId(), k -> new HashSet<>())
                      .add(log.getUserId());
        }
        log.info("[CF相似度] 活跃用户数: {}, 涉及歌曲数: {}", userTracks.size(), trackUsers.size());

        // ============ 2.5. 过滤已下架/删除的歌曲 ============
        Set<Long> activeTrackIds = trackMapper.selectList(
                new LambdaQueryWrapper<Track>()
                        .eq(Track::getStatus, 0)
                        .select(Track::getId)
        ).stream()
                .map(Track::getId)
                .collect(Collectors.toSet());
        log.info("[CF相似度] 有效歌曲数（status=0）: {}", activeTrackIds.size());

        // 移除不存在的歌曲
        long removedTrackCount = trackUsers.keySet().stream()
                .filter(trackId -> !activeTrackIds.contains(trackId))
                .count();
        trackUsers.keySet().removeIf(trackId -> !activeTrackIds.contains(trackId));
        log.info("[CF相似度] 移除的无效歌曲数: {}", removedTrackCount);

        // 过滤每个用户的歌曲列表，移除无效歌曲
        for (Map.Entry<Long, Set<Long>> entry : userTracks.entrySet()) {
            entry.getValue().removeIf(trackId -> !activeTrackIds.contains(trackId));
        }
        // 移除歌曲集合为空的用户
        userTracks.entrySet().removeIf(entry -> entry.getValue().isEmpty());

        log.info("[CF相似度] 过滤后活跃用户数: {}, 有效歌曲数: {}", userTracks.size(), trackUsers.size());

        if (trackUsers.isEmpty()) {
            log.info("[CF相似度] 过滤后无有效歌曲，清空旧数据后结束");
            cfSimilarityTopnMapper.delete(new LambdaQueryWrapper<>());
            clearRedisKeys();
            return;
        }

        // ============ 3. 计算共现次数 ============
        // coOccurrence[i][j] = 同时喜欢 i 和 j 的用户数
        Map<Long, Map<Long, Integer>> coOccurrence = new HashMap<>();
        for (Map.Entry<Long, Set<Long>> entry : userTracks.entrySet()) {
            List<Long> trackList = new ArrayList<>(entry.getValue());
            for (int i = 0; i < trackList.size(); i++) {
                for (int j = i + 1; j < trackList.size(); j++) {
                    Long t1 = trackList.get(i);
                    Long t2 = trackList.get(j);
                    coOccurrence.computeIfAbsent(t1, k -> new HashMap<>()).merge(t2, 1, Integer::sum);
                    coOccurrence.computeIfAbsent(t2, k -> new HashMap<>()).merge(t1, 1, Integer::sum);
                }
            }
        }
        log.info("[CF相似度] 共现矩阵构建完成，涉及歌曲对数: {}", coOccurrence.size());

        // ============ 4. 计算余弦相似度 + TopN 筛选 ============
        // sim(i,j) = |Ui ∩ Uj| / sqrt(|Ui| * |Uj|)
        List<CfSimilarityTopn> allRecords = new ArrayList<>();
        for (Map.Entry<Long, Map<Long, Integer>> entry : coOccurrence.entrySet()) {
            Long trackI = entry.getKey();
            int sizeI = trackUsers.getOrDefault(trackI, Collections.emptySet()).size();
            if (sizeI == 0) continue;

            // 计算所有候选相似度
            List<double[]> candidates = new ArrayList<>(); // [targetTrackId, simCf]
            for (Map.Entry<Long, Integer> coEntry : entry.getValue().entrySet()) {
                Long trackJ = coEntry.getKey();
                int coCount = coEntry.getValue();
                int sizeJ = trackUsers.getOrDefault(trackJ, Collections.emptySet()).size();
                if (sizeJ == 0) continue;

                double similarity = coCount / Math.sqrt((double) sizeI * sizeJ);
                candidates.add(new double[]{trackJ, similarity});
            }

            // 按相似度降序排序，取 TopN
            candidates.sort((a, b) -> Double.compare(b[1], a[1]));
            int limit = Math.min(TOP_N, candidates.size());

            for (int rank = 0; rank < limit; rank++) {
                CfSimilarityTopn record = new CfSimilarityTopn();
                record.setSourceTrackId(trackI);
                record.setTargetTrackId((long) candidates.get(rank)[0]);
                record.setSimCf(candidates.get(rank)[1]);
                record.setSimilarityRank(rank + 1);
                allRecords.add(record);
            }
        }
        log.info("[CF相似度] 相似度计算完成，总记录数: {}", allRecords.size());

        // ============ 5. 写入 cf_similarity_topn 表 ============
        // 先清空旧数据
        cfSimilarityTopnMapper.delete(new LambdaQueryWrapper<>());
        // 分批批量插入
        for (int i = 0; i < allRecords.size(); i += BATCH_SIZE) {
            int end = Math.min(i + BATCH_SIZE, allRecords.size());
            cfSimilarityTopnMapper.batchInsert(allRecords.subList(i, end));
        }
        log.info("[CF相似度] 数据已写入 cf_similarity_topn 表");

        // ============ 6. 从表中读取数据存入 Redis ============
        saveToRedis();

        long elapsed = System.currentTimeMillis() - startTime;
        log.info("[CF相似度] 离线计算完成，耗时: {}ms", elapsed);
    }

    /**
     * 从 cf_similarity_topn 表读取全量数据，按 source_track_id 分组后写入 Redis。
     * Key: auramix:cf:similar:{sourceTrackId}
     * Value: JSON 数组 [{"targetTrackId":..,"simCf":..,"rank":..}, ...]
     */
    private void saveToRedis() {
        // 清除旧 key
        clearRedisKeys();

        // 从表读取全量数据
        List<CfSimilarityTopn> allRecords = cfSimilarityTopnMapper.selectList(
                new LambdaQueryWrapper<CfSimilarityTopn>()
                        .orderByAsc(CfSimilarityTopn::getSourceTrackId)
                        .orderByAsc(CfSimilarityTopn::getSimilarityRank)
        );

        // 按 sourceTrackId 分组
        Map<Long, List<CfSimilarityTopn>> grouped = allRecords.stream()
                .collect(Collectors.groupingBy(CfSimilarityTopn::getSourceTrackId));

        int redisCount = 0;
        for (Map.Entry<Long, List<CfSimilarityTopn>> entry : grouped.entrySet()) {
            String key = REDIS_KEY_PREFIX + entry.getKey();
            List<Map<String, Object>> valueList = entry.getValue().stream()
                    .map(r -> {
                        Map<String, Object> m = new LinkedHashMap<>();
                        m.put("targetTrackId", r.getTargetTrackId());
                        m.put("simCf", r.getSimCf());
                        m.put("rank", r.getSimilarityRank());
                        return m;
                    })
                    .collect(Collectors.toList());
            try {
                String json = objectMapper.writeValueAsString(valueList);
                stringRedisTemplate.opsForValue().set(key, json);
                redisCount++;
            } catch (Exception e) {
                log.error("[CF相似度] Redis 写入失败 key={}", key, e);
            }
        }
        log.info("[CF相似度] Redis 写入完成，共 {} 个 key", redisCount);
    }

    /**
     * 清除 Redis 中所有旧的 CF 相似度 key
     */
    private void clearRedisKeys() {
        Set<String> keys = stringRedisTemplate.keys(REDIS_KEY_PREFIX + "*");
        if (keys != null && !keys.isEmpty()) {
            stringRedisTemplate.delete(keys);
            log.info("[CF相似度] 已清除 {} 个旧 Redis key", keys.size());
        }
    }
}
