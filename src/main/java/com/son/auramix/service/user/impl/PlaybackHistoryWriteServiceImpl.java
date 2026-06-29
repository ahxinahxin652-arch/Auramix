package com.son.auramix.service.user.impl;

import com.son.auramix.domain.dto.user.PlaybackRecordDTO;
import com.son.auramix.domain.entity.PlaybackHistory;
import com.son.auramix.mapper.PlaybackHistoryMapper;
import com.son.auramix.service.user.PlaybackHistoryWriteService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

/**
 * 播放历史异步写入实现 — @Async 投递到专用线程池，主线程立即返回
 */
@Slf4j
@Service
public class PlaybackHistoryWriteServiceImpl implements PlaybackHistoryWriteService {

    private final PlaybackHistoryMapper playbackHistoryMapper;

    private static final int MAX_RETRIES = 3;
    private static final long INITIAL_BACKOFF_MS = 200;

    public PlaybackHistoryWriteServiceImpl(PlaybackHistoryMapper playbackHistoryMapper) {
        this.playbackHistoryMapper = playbackHistoryMapper;
    }

    @Override
    @Async("logWriteExecutor")
    public void recordPlaybackAsync(PlaybackRecordDTO req, Long userId) {
        String taskKey = String.format("[PlaybackHistory] userId=%d trackId=%d", userId, req.getTrackId());
        executeWithRetry(taskKey, () -> {
            PlaybackHistory history = new PlaybackHistory();
            history.setUserId(userId);
            history.setTrackId(req.getTrackId());
            history.setContextType(req.getContextType());
            history.setContextId(req.getContextId());
            playbackHistoryMapper.insert(history);
            log.info("{} id={}", taskKey, history.getId());
        });
    }

    // ============================ 通用重试 ============================

    private void executeWithRetry(String taskKey, Runnable action) {
        for (int attempt = 1; attempt <= MAX_RETRIES; attempt++) {
            try {
                action.run();
                return;
            } catch (Exception e) {
                log.warn("{} 第 {} 次写入失败: {}", taskKey, attempt, e.getMessage());
                if (attempt < MAX_RETRIES) {
                    try {
                        Thread.sleep(INITIAL_BACKOFF_MS * (1L << (attempt - 1)));
                    } catch (InterruptedException ie) {
                        Thread.currentThread().interrupt();
                        break;
                    }
                } else {
                    log.error("{} 重试 {} 次全部失败，已丢弃", taskKey, MAX_RETRIES, e);
                }
            }
        }
    }
}
