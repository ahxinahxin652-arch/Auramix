package com.son.auramix.service.recommend;

import com.son.auramix.domain.entity.UserPreferenceVector;
import com.son.auramix.domain.vo.user.RecommendTrackVO;

import java.util.List;

/**
 * 用户偏好向量 & 每日推荐服务接口
 * <p>
 * 每日 00:00 离线计算每个用户的偏好向量，并基于向量生成 20 首每日推荐歌曲。
 * 用户登录时将偏好向量和每日推荐缓存到 Redis，TTL 至当日 00:00 过期。
 *
 * @author auramix
 */
public interface UserPreferenceService {

    /**
     * 全量计算所有用户的偏好向量 + 每日推荐（由定时任务调用）
     */
    void computeAll();

    /**
     * 用户登录时缓存偏好向量和每日推荐到 Redis
     *
     * @param userId 用户 ID
     */
    void cacheOnLogin(Long userId);

    /**
     * 获取用户偏好向量（优先读 Redis，过期则从 DB 重新加载）
     *
     * @param userId 用户 ID
     * @return 偏好向量，不存在返回 null
     */
    UserPreferenceVector getUserPreferenceVector(Long userId);

    /**
     * 获取每日推荐歌曲列表（优先读 Redis，过期则从 DB 重新加载）
     *
     * @param userId 用户 ID
     * @return 推荐歌曲列表（含播放信息）
     */
    List<RecommendTrackVO> getDailyRecommendations(Long userId);
}
