package com.son.auramix.service.user;

import com.son.auramix.domain.dto.user.PlaybackRecordDTO;

/**
 * 播放历史异步写入服务 — 写入频繁，不能阻塞主线程
 */
public interface PlaybackHistoryWriteService {

    /** 异步写入播放历史，失败时自动重试 3 次 */
    void recordPlaybackAsync(PlaybackRecordDTO req, Long userId);
}
