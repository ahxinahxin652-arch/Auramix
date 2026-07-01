package com.son.auramix.service.recommend;

/**
 * 协同过滤相似度离线计算服务接口
 *
 * @author auramix
 */
public interface CfSimilarityService {

    /**
     * 全量计算歌曲间协同过滤相似度，结果写入 cf_similarity_topn 表和 Redis。
     * <p>
     * 算法步骤：
     * 1. 从 user_behavior_logs 提取正反馈（播放时长 ≥ 30 秒）
     * 2. 计算歌曲间共现次数
     * 3. 计算余弦相似度
     * 4. 每首歌保留 TopN 200，写入 MySQL + Redis
     */
    void computeAndSave();
}
