package com.son.auramix.job;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.son.auramix.domain.entity.Track;
import com.son.auramix.domain.entity.TrackReviewRecord;
import com.son.auramix.mapper.TrackMapper;
import com.son.auramix.mapper.TrackReviewRecordMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * 定时任务：每天 05:00 处理高置信度审核结果
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class ReviewScheduleJob {

    private final TrackReviewRecordMapper reviewRecordMapper;
    private final TrackMapper trackMapper;

    @Scheduled(cron = "0 0 5 * * ?")
    public void processAutoReviewResults() {
        // 查询 status=1 (AI审核完成待自动处理) 的记录
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
                    // FAIL → Track.status=-1 (已下架)
                    track.setStatus(-1);
                }
                trackMapper.updateById(track);

                record.setStatus(2);
                reviewRecordMapper.updateById(record);

                log.info("[定时审核] trackId={} 自动处理完成 Track.status={}", record.getTrackId(), track.getStatus());

            } catch (Exception e) {
                log.error("[定时审核] trackId={} 处理异常", record.getTrackId(), e);
            }
        }

        log.info("[定时审核] 处理完成");
    }
}
