package com.son.auramix.job;

import com.son.auramix.service.recommend.ExploreSongService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

/**
 * 探索发现推荐离线计算定时任务
 * <p>
 * 每日 00:15 全量计算（比偏好向量任务 00:00 延迟 15 分钟，确保偏好向量已写入）：
 * <ol>
 *   <li>读取用户偏好向量（user_preference_vectors），计算各流派熟悉度</li>
 *   <li>优先选择用户从未听过的流派/无流派歌曲，其次听过少的流派歌曲</li>
 *   <li>通过 track_audio_features 筛选与用户近期听歌差异过大的歌曲</li>
 *   <li>通过 liked_tracks 排除已红心的歌曲</li>
 *   <li>通过 playback_history 排除近 30 天听过的歌曲</li>
 *   <li>通过 tracks.play_count 强制筛选播放量从少到多的冷门歌曲</li>
 *   <li>最终返回 10 首歌，写入 daily_recommendations 表，source=3</li>
 * </ol>
 * <p>
 * 每日推荐接口只返回 source=0,1,2；探索发现接口只返回 source=3。
 *
 * @author auramix
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class ExploreSongJob {

    private final ExploreSongService exploreSongService;

    /**
     * 每日 00:15 触发（延迟 15 分钟等待偏好向量计算完成）
     */
    @Scheduled(cron = "0 15 0 * * ?")
    public void run() {
        log.info("[ExploreSongJob] 每日 00:15 定时任务触发，开始计算探索发现推荐");
        try {
            exploreSongService.computeAll();
        } catch (Exception e) {
            log.error("[ExploreSongJob] 计算失败", e);
        }
    }
}
