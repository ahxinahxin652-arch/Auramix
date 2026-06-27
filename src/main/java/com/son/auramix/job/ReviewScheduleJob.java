package com.son.auramix.job;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.son.auramix.domain.entity.Track;
import com.son.auramix.domain.entity.TrackReviewRecord;
import com.son.auramix.mapper.TrackMapper;
import com.son.auramix.mapper.TrackReviewRecordMapper;
import com.son.auramix.service.admin.ReviewService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

/**
 * 定时任务：每天 05:00
 * 1. 处理高置信度审核结果（track_review_records.status=1）
 * 2. 扫描仍处于待审核状态的 songs（tracks.status=3）且无活跃审核记录，补触发 AI 审核
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class ReviewScheduleJob {

    private final TrackReviewRecordMapper reviewRecordMapper;
    private final TrackMapper trackMapper;
    private final ReviewService reviewService;

    @Scheduled(cron = "0 0 5 * * ?")
    public void processAutoReviewResults() {
        log.info("[定时审核] 开始执行");
        processHighConfidenceRecords();
        retriggerPendingReviewTracks();
        log.info("[定时审核] 执行完成");
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
     * "活跃审核记录"定义：该 trackId 在 track_review_records 中存在 status ∈ {0,1,3} 的记录
     * （0=AI审核中, 1=待自动处理, 3=待人工确认）——这些状态表示审核流程仍在进行中，不应重复触发。
     * 仅对完全没有审核记录、或仅有已完结记录（status ∈ {2,4}）的歌曲补触发。
     */
    private void retriggerPendingReviewTracks() {
        // 1. 查询所有待审核歌曲
        List<Track> pendingTracks = trackMapper.selectList(
                new LambdaQueryWrapper<Track>().eq(Track::getStatus, 3));
        if (pendingTracks == null || pendingTracks.isEmpty()) {
            log.info("[定时审核] 无 status=3 待审核歌曲");
            return;
        }

        List<Long> pendingTrackIds = pendingTracks.stream()
                .map(Track::getId)
                .collect(Collectors.toList());

        // 2. 查询这些歌曲中已有活跃审核记录的 trackId
        List<Integer> activeStatuses = Arrays.asList(0, 1, 3);
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
            return;
        }

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
}

