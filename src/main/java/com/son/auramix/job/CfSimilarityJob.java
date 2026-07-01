package com.son.auramix.job;

import com.son.auramix.service.recommend.CfSimilarityService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

/**
 * 协同过滤相似度离线计算定时任务。
 * <p>
 * 每日 00:00 全量计算歌曲间相似度，写入 cf_similarity_topn 表和 Redis。
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class CfSimilarityJob {

    private final CfSimilarityService cfSimilarityService;

    @Scheduled(cron = "0 0 0,12 * * ?")
    public void run() {
        log.info("[CfSimilarityJob] 每日定时任务触发，开始计算歌曲相似度矩阵");
        try {
            cfSimilarityService.computeAndSave();
        } catch (Exception e) {
            log.error("[CfSimilarityJob] 计算失败", e);
        }
    }
}
