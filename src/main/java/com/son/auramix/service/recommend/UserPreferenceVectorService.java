package com.son.auramix.service.recommend;

import com.son.auramix.domain.entity.DailyRecommendation;
import com.son.auramix.domain.entity.UserPreferenceVector;

import java.util.List;

/**
 * 用户偏好向量与每日推荐服务
 * <p>
 * 1. 每日 00:00 离线计算所有用户的偏好向量，写入 user_preference_vectors 表
 * 2. 基于偏好向量生成每日 20 首推荐，写入 daily_recommendations 表
 * 3. 用户登录时将偏好向量与每日推荐缓存至 Redis（TTL 至次日 00:00）
 * 4. 读取时优先走 Redis，过期则回源数据库
 *
 * @author auramix
 */
public interface UserPreferenceVectorService {

    /**
     * 离线计算全量用户偏好向量 + 每日推荐（定时任务调用）
     */
    void computeAndSave();

    /**
     * 获取用户偏好向量（Redis 优先，过期回源 DB）
     */
    UserPreferenceVector getPreferenceVector(Long userId);

    /**
     * 获取用户每日推荐（Redis 优先，过期回源 DB）
     */
    List<DailyRecommendation> getDailyRecommendations(Long userId);

    /**
     * 用户登录时缓存偏好向量与每日推荐到 Redis（已存在则跳过）
     */
    void cacheOnLogin(Long userId);
}
