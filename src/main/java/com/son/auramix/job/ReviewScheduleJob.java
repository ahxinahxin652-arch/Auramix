package com.son.auramix.job;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.son.auramix.domain.entity.Track;
import com.son.auramix.domain.entity.TrackReviewRecord;
import com.son.auramix.mapper.TrackMapper;
import com.son.auramix.mapper.TrackReviewRecordMapper;
import com.son.auramix.service.admin.ReviewService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

/**
 * 审核定时任务：
 * 1. 应用启动时立即扫描一次待审核歌曲补触发审核
 * 2. 每天 05:00 处理高置信度审核结果（track_review_records.status=1）：按 AI 裁决自动上架/下架
 * 3. 每小时整点扫描仍处于待审核状态的 songs（tracks.status=3）且无活跃审核记录，补触发 AI 审核；
 *    同时重试卡在 status=0 (AI审核中) 超过 30 分钟的审核记录（避免异常导致永久卡死）
 * <p>
 * 管理员可在 status=1 (待自动处理) 或 status=3 (待人工确认) 期间随时通过 confirmReview 提前人工确认，
 * 不必等到第二天 05:00 的自动处理。
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class ReviewScheduleJob {

    private final TrackReviewRecordMapper reviewRecordMapper;
    private final TrackMapper trackMapper;
    private final ReviewService reviewService;

    /**
     * 应用启动完成后立即执行一次补审核扫描，避免重启后遗漏的待审核歌曲需等到下个整点才处理
     */
    @EventListener(ApplicationReadyEvent.class)
    public void onApplicationReady() {
        log.info("[定时审核] 应用启动，立即执行一次补审核扫描");
        retriggerPendingReviewTracks();
    }

    /**
     * 每天 05:00 处理高置信度审核结果：对仍处于 status=1 (待自动处理) 的记录按 AI 裁决自动上架/下架。
     * 管理员若已在 05:00 前人工确认，记录会变为 status=4，本任务不会再处理。
     */
    @Scheduled(cron = "0 0 5 * * ?")
    public void processAutoReviewResults() {
        log.info("[定时审核] 高置信度处理开始");
        processHighConfidenceRecords();
        log.info("[定时审核] 高置信度处理完成");
    }

    /**
     * 每小时整点扫描待审核歌曲，对无活跃审核记录的补触发 AI 审核
     */
    @Scheduled(cron = "0 0 * * * ?")
    public void scanPendingReviewTracks() {
        log.info("[定时审核] 补审核扫描开始");
        retriggerPendingReviewTracks();
        log.info("[定时审核] 补审核扫描完成");
    }

    /**
     * 处理 status=1 (AI审核完成待自动处理) 的记录：按裁决更新 Track.status
     */
    private void processHighConfidenceRecords() {
        LambdaQueryWrapper<TrackReviewRecord> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(TrackReviewRecord::getStatus, 1);
        List<TrackReviewRecord> pending = reviewRecordMapper.selectList(wrapper);

        if (pending == null || pending.isEmpty()) {
            log.info("[定时审核] 无待自动处理记录");
            return;
        }

        log.info("[定时审核] 开始处理 {} 条待自动处理记录", pending.size());

        for (TrackReviewRecord record : pending) {
            try {
                Track track = trackMapper.selectById(record.getTrackId());
                if (track == null) {
                    log.warn("[定时审核] trackId={} 不存在，跳过", record.getTrackId());
                    record.setStatus(2);
                    reviewRecordMapper.updateById(record);
                    continue;
                }

                if (record.getVerdict() == 1) {
                    // PASS → Track.status=0 (正常)
                    track.setStatus(0);
                } else if (record.getVerdict() == -1) {
                    // FAIL → Track.status=1 (已下架)
                    track.setStatus(1);
                }
                trackMapper.updateById(track);

                record.setStatus(2);
                reviewRecordMapper.updateById(record);

                log.info("[定时审核] trackId={} 自动处理完成 Track.status={}", record.getTrackId(), track.getStatus());

            } catch (Exception e) {
                log.error("[定时审核] trackId={} 处理异常", record.getTrackId(), e);
            }
        }
    }

    /**
     * 扫描 tracks.status=3 (待审核) 且无活跃审核记录的歌曲，补触发 AI 审核。
     * <p>
     * "活跃审核记录"定义：该 trackId 在 track_review_records 中存在 status ∈ {1,3} 的记录
     * （1=待自动处理, 3=待人工确认）——这些状态表示审核流程已产出结果仍在处理中，不应重复触发。
     * status=0 (AI审核中) 不再视为"活跃"，因为异步审核可能因异常卡死；
     * 卡在 status=0 超过 30 分钟的记录由 {@link #retryStuckReviewRecords()} 重试。
     * 仅对完全没有审核记录、或仅有已完结/失败记录（status ∈ {2,4,5}）的歌曲补触发。
     */
    private void retriggerPendingReviewTracks() {
        // 1. 查询所有待审核歌曲
        List<Track> pendingTracks = trackMapper.selectList(
                new LambdaQueryWrapper<Track>().eq(Track::getStatus, 3));
        if (pendingTracks == null || pendingTracks.isEmpty()) {
            log.info("[定时审核] 无 status=3 待审核歌曲");
            // 即使没有待审核歌曲，也仍需重试卡死的审核记录
            retryStuckReviewRecords();
            return;
        }

        List<Long> pendingTrackIds = pendingTracks.stream()
                .map(Track::getId)
                .collect(Collectors.toList());

        // 2. 查询这些歌曲中已有活跃审核记录的 trackId（1/3 视为活跃，0 由 retryStuck 单独处理）
        List<Integer> activeStatuses = Arrays.asList(1, 3);
        List<TrackReviewRecord> activeRecords = reviewRecordMapper.selectList(
                new LambdaQueryWrapper<TrackReviewRecord>()
                        .in(TrackReviewRecord::getTrackId, pendingTrackIds)
                        .in(TrackReviewRecord::getStatus, activeStatuses));
        java.util.Set<Long> activeTrackIds = activeRecords.stream()
                .map(TrackReviewRecord::getTrackId)
                .collect(Collectors.toSet());

        // 3. 过滤出无活跃审核记录的歌曲，补触发审核
        List<Track> toReview = pendingTracks.stream()
                .filter(t -> !activeTrackIds.contains(t.getId()))
                .collect(Collectors.toList());

        if (toReview.isEmpty()) {
            log.info("[定时审核] 所有 {} 首待审核歌曲均有活跃审核记录，无需补触发", pendingTracks.size());
        } else {
            log.info("[定时审核] 发现 {} 首待审核歌曲无活跃审核记录，开始补触发", toReview.size());
            int triggered = 0;
            for (Track t : toReview) {
                try {
                    // triggerReview 标注 @Async，调用后立即返回，审核在 reviewTaskExecutor 线程池异步执行
                    reviewService.triggerReview(t.getId());
                    triggered++;
                } catch (Exception e) {
                    log.error("[定时审核] 补触发审核异常 trackId={}", t.getId(), e);
                }
            }
            log.info("[定时审核] 补触发完成，共 {} 首", triggered);
        }

        // 4. 重试卡在 status=0 超过 30 分钟的审核记录
        retryStuckReviewRecords();
    }

    /**
     * 重试卡在 status=0 (AI审核中) 超过 30 分钟的审核记录。
     * <p>
     * 异步审核可能因 LLM 调用异常、线程池拒绝等导致记录永久停在 status=0，
     * 这里把超时的卡死记录对应 track 重新触发审核（triggerReview 会新插入一条记录）。
     */
    private void retryStuckReviewRecords() {
        LocalDateTime threshold = LocalDateTime.now().minusMinutes(30);
        List<TrackReviewRecord> stuckRecords = reviewRecordMapper.selectList(
                new LambdaQueryWrapper<TrackReviewRecord>()
                        .eq(TrackReviewRecord::getStatus, 0)
                        .lt(TrackReviewRecord::getCreatedAt, threshold));

        if (stuckRecords == null || stuckRecords.isEmpty()) {
            return;
        }

        log.info("[定时审核] 发现 {} 条卡在 status=0 超过 30 分钟的审核记录，开始重试", stuckRecords.size());
        int triggered = 0;
        for (TrackReviewRecord r : stuckRecords) {
            try {
                // 将旧记录标记为失败(status=5)，避免下次再次扫描到
                r.setStatus(5);
                r.setFailReasons("审核超时未完成，由定时任务标记为失败并重试");
                reviewRecordMapper.updateById(r);

                // 重新触发审核（会新插入一条 status=0 的记录）
                reviewService.triggerReview(r.getTrackId());
                triggered++;
            } catch (Exception e) {
                log.error("[定时审核] 重试卡死记录异常 recordId={} trackId={}", r.getId(), r.getTrackId(), e);
            }
        }
        log.info("[定时审核] 卡死记录重试完成，共 {} 条", triggered);
    }
}

