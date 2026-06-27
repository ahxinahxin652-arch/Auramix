package com.son.auramix.event;

import com.son.auramix.service.admin.ReviewService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

/**
 * 监听歌曲创建/更新事务提交事件，事务提交后异步触发 AI 审核。
 * <p>
 * 之所以用 AFTER_COMMIT 事务事件而非直接在 Service 内调用 @Async triggerReview：
 * 原实现中 createTrack(@Transactional) 直接调用 @Async triggerReview，
 * 异步线程用独立 DB 连接查询刚插入的 track 时，外层事务尚未提交，导致
 * selectById 返回 null，审核被静默跳过。
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class TrackReviewEventListener {

    private final ReviewService reviewService;

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    @Async("reviewTaskExecutor")
    public void onTrackCreated(TrackCreatedEvent event) {
        Long trackId = event.getTrackId();
        if (trackId == null) {
            log.warn("[AI审核事件] 收到 trackId 为 null 的事件，跳过");
            return;
        }
        log.info("[AI审核事件] trackId={} 事务已提交，异步触发审核", trackId);
        try {
            reviewService.triggerReview(trackId);
        } catch (Exception e) {
            log.error("[AI审核事件] trackId={} 触发审核异常", trackId, e);
        }
    }
}
