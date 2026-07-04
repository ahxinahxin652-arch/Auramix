package com.son.auramix.job;

import com.son.auramix.service.recommend.UserPreferenceService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

/**
 * 用户偏好向量 & 每日推荐离线计算定时任务
 * <p>
 * 每日 00:00 全量计算：
 * <ol>
 *   <li>每个用户的长期/短期偏好向量（流派、艺人）</li>
 *   <li>基于偏好向量为每个用户生成 20 首每日推荐，写入 daily_recommendations 表</li>
 * </ol>
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class UserPreferencesVectorsJob {

    private final UserPreferenceService userPreferenceService;

    @Scheduled(cron = "0 0 0 * * ?")
    public void run() {
        log.info("[UserPreferencesVectorsJob] 每日 00:00 定时任务触发，开始计算用户偏好向量 + 每日推荐");
        try {
            userPreferenceService.computeAll();
        } catch (Exception e) {
            log.error("[UserPreferencesVectorsJob] 计算失败", e);
        }
    }
}
