package com.son.auramix.service.recommend;

import com.son.auramix.domain.vo.user.RecommendTrackVO;

import java.util.List;

/**
 * 探索发现推荐服务接口
 * <p>
 * 每日 00:00 离线计算，为每个用户生成 10 首探索发现歌曲（source=3）。
 * 算法策略：优先选择用户从未听过的流派/无流派歌曲，其次听过少的流派歌曲；
 * 通过音频特征筛选差异过大的歌曲；排除已红心和近 30 天听过的歌曲；
 * 最终按播放量从少到多取冷门歌曲。
 * <p>
 * 每日推荐接口只返回 source=0,1,2；探索发现接口只返回 source=3。
 *
 * @author auramix
 */
public interface ExploreSongService {

    /**
     * 全量计算所有用户的探索发现推荐（由定时任务调用）
     */
    void computeAll();

    /**
     * 获取用户的探索发现推荐歌曲列表（优先读 Redis，过期则从 DB 重新加载）
     *
     * @param userId 用户 ID
     * @return 探索推荐歌曲列表（含播放信息）
     */
    List<RecommendTrackVO> getExploreRecommendations(Long userId);
}
