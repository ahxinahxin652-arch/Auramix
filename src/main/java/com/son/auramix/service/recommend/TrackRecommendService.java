package com.son.auramix.service.recommend;

import com.son.auramix.domain.vo.user.RecommendTrackVO;

import java.util.List;

/**
 * 歌曲相似推荐服务接口
 * <p>
 * 三路融合推荐：内容相似（音频特征）+ 协同过滤 + 文化相似（艺人/流派）
 *
 * @author auramix
 */
public interface TrackRecommendService {

    /**
     * 为用户计算指定歌曲的相似推荐，结果写入 Redis。
     * <p>
     * 三路候选并行计算：
     * 1. 内容相似：基于 track_audio_features（mode/timesig/tempo/mfcc/特征向量）
     * 2. 协同过滤：从 Redis 读取 sim_cf 列表，取前 200
     * 3. 文化相似：同艺人 + 同流派，culture_score = 0.6*同主要艺人 + 0.3*流派重叠 + 0.1*合作艺人
     * <p>
     * 权重融合：final = 0.4*content + 0.35*cf + 0.25*culture，取 Top 20
     * <p>
     * 每人拥有独立的推荐歌单，Redis key: auramix:recommend:similar:{userId}:{trackId}
     *
     * @param userId  用户 ID
     * @param trackId 目标歌曲 ID
     */
    void computeAndSaveRecommendations(Long userId, Long trackId);

    /**
     * 获取推荐歌单（优先读 Redis 缓存，未命中则同步计算），返回含播放信息的列表。
     *
     * @param userId  用户 ID
     * @param trackId 目标歌曲 ID
     * @return 推荐歌曲列表（含 title/artists/cover/audioUrl + score/sources）
     */
    List<RecommendTrackVO> getRecommendations(Long userId, Long trackId);

    /**
     * 删除指定用户对指定歌曲的推荐缓存
     *
     * @param userId  用户 ID
     * @param trackId 目标歌曲 ID
     */
    void deleteRecommendations(Long userId, Long trackId);
}
