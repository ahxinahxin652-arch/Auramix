package com.son.auramix.service.admin.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.son.auramix.ai.aggregator.AgentResultsFormatter;
import com.son.auramix.ai.dto.AgentResult;
import com.son.auramix.ai.dto.ReviewContext;
import com.son.auramix.ai.lyrics.LyricsFetcher;
import com.son.auramix.ai.orchestrator.ReviewOrchestrator;
import com.son.auramix.ai.progress.ProgressEvent;
import com.son.auramix.ai.progress.ReviewProgressSseRegistry;
import com.son.auramix.ai.progress.ReviewProgressStore;
import com.son.auramix.common.exception.BusinessException;
import com.son.auramix.common.result.PageResult;
import com.son.auramix.common.result.ResultCode;
import com.son.auramix.domain.dto.admin.ReviewConfirmDTO;
import com.son.auramix.domain.entity.*;
import com.son.auramix.domain.vo.admin.ReviewListItemVO;
import com.son.auramix.mapper.*;
import com.son.auramix.service.admin.ReviewService;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.support.TransactionTemplate;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ReviewServiceImpl implements ReviewService {

    private final TrackMapper trackMapper;
    private final AlbumMapper albumMapper;
    private final ArtistMapper artistMapper;
    private final TrackArtistMapper trackArtistMapper;
    private final TrackReviewRecordMapper reviewRecordMapper;
    private final LyricsFetcher lyricsFetcher;
    private final ReviewOrchestrator orchestrator;
    private final AgentResultsFormatter agentResultsFormatter;
    private final ReviewProgressStore progressStore;
    private final ReviewProgressSseRegistry sseRegistry;
    /**
     * Spring 自动注入的事务管理器；用于构造 {@link #transactionTemplate}，
     * 把"读+校验"放到事务外、只把"两个 UPDATE"放进极短事务内，
     * 避免行锁持有时间跨整个方法执行窗口，导致与异步 AI 审核的事务互相等待触发 lock_wait_timeout。
     */
    private final PlatformTransactionManager transactionManager;
    private TransactionTemplate transactionTemplate;

    @PostConstruct
    public void initTransactionTemplate() {
        this.transactionTemplate = new TransactionTemplate(transactionManager);
    }

    @Override
    @Async("reviewTaskExecutor")
    public void triggerReview(Long trackId) {
        log.info("[AI审核] trackId={} 开始触发审核", trackId);
        TrackReviewRecord record = null;
        try {
            Track track = trackMapper.selectById(trackId);
            if (track == null) {
                log.warn("[AI审核] trackId={} 不存在，跳过审核", trackId);
                return;
            }

            // 设置 Track.status = 3 (待审核，隔离播放)
            track.setStatus(3);
            trackMapper.updateById(track);

            // 查询专辑信息
            String albumTitle = null;
            if (track.getAlbumId() != null) {
                Album album = albumMapper.selectById(track.getAlbumId());
                if (album != null) {
                    albumTitle = album.getTitle();
                }
            }

            // 查询歌手信息
            String artistNames = null;
            List<TrackArtist> trackArtists = trackArtistMapper.selectList(
                    new LambdaQueryWrapper<TrackArtist>().eq(TrackArtist::getTrackId, trackId));
            if (trackArtists != null && !trackArtists.isEmpty()) {
                List<Long> artistIds = trackArtists.stream()
                        .map(TrackArtist::getArtistId)
                        .distinct()
                        .collect(Collectors.toList());
                List<Artist> artists = artistMapper.selectBatchIds(artistIds);
                if (artists != null) {
                    artistNames = artists.stream()
                            .map(Artist::getName)
                            .collect(Collectors.joining(", "));
                }
            }

            // 先创建审核记录（status=0, AI审核中），尽早落库以保证失败也能留痕
            record = new TrackReviewRecord();
            record.setTrackId(trackId);
            record.setTrackTitle(track.getTitle());
            record.setArtistNames(artistNames);
            record.setAlbumTitle(albumTitle);
            record.setVerdict(0);
            record.setConfidence(0);
            record.setStatus(0);
            reviewRecordMapper.insert(record);

            // 拉取歌词（可能抛异常，已落库 record 故 catch 中可更新失败状态）
            String lyricsContent = lyricsFetcher.fetch(track.getLyricsUrl());
            boolean hasLyrics = lyricsFetcher.hasValidLyrics(lyricsContent);
            record.setLyricsContent(lyricsContent);
            reviewRecordMapper.updateById(record);

            // 构建审核上下文
            ReviewContext ctx = ReviewContext.builder()
                    .trackId(trackId)
                    .trackTitle(track.getTitle())
                    .artistNames(artistNames)
                    .albumTitle(albumTitle)
                    .lyricsContent(lyricsContent)
                    .hasLyrics(hasLyrics)
                    .reviewType("TEXT_ONLY")
                    .build();

            // 执行审核流水线
            ReviewOrchestrator.PipelineResult pipeline = orchestrator.execute(ctx, record.getId());
            List<AgentResult> dimensionResults = pipeline.getDimensionResults();
            AgentResult finalResult = pipeline.getFinalResult();

            // 直接用 orchestrator 聚合好的 JSON（含 dimensionSummary）
            String agentResultsJson = pipeline.getAgentResultsJson();

            // 更新审核记录
            record.setAgentResults(agentResultsJson);
            record.setConfidence(finalResult.getConfidence());
            record.setFailReasons(finalResult.getReason());

            int confidence = finalResult.getConfidence();
            boolean isFail = finalResult.isFail();

            if (confidence >= 80) {
                // 高置信度 → 待自动处理(status=1)：由每天 05:00 定时任务自动上架/下架；
                // 管理员也可在此之前通过 confirmReview 提前人工确认（confirmReview 不再做状态检查）
                record.setVerdict(isFail ? -1 : 1);
                record.setStatus(1);
            } else {
                // 低置信度 → 待人工确认(status=3)
                record.setVerdict(-2);
                record.setStatus(3);
            }

            // 条件更新：仅当 status=0 时才更新，避免在管理员已确认(status=4)后覆盖其决定
            int updated = reviewRecordMapper.update(record,
                    new LambdaQueryWrapper<TrackReviewRecord>()
                            .eq(TrackReviewRecord::getId, record.getId())
                            .eq(TrackReviewRecord::getStatus, 0));
            if (updated == 0) {
                log.info("[AI审核] trackId={} 审核完成时发现记录已被人工确认，跳过更新以保留管理员决定", trackId);
                // 即使管理员已确认，也要关闭 SSE 连接避免客户端挂死
                try {
                    sseRegistry.complete(record.getId());
                } catch (Exception ex) {
                    log.warn("[AI审核] trackId={} SSE complete 异常", trackId, ex);
                }
                return;
            }
            log.info("[AI审核] trackId={} 最终裁决 verdict={} confidence={} status={}",
                    trackId, record.getVerdict(), confidence, record.getStatus());

            // 推 FINISHED 事件 + 关闭 SSE 连接
            try {
                progressStore.finished(record.getId(), record.getStatus(), record.getVerdict(), record.getConfidence());
                sseRegistry.send(record.getId(), ProgressEvent.finished(record.getId(), trackId,
                        record.getStatus(), record.getVerdict(), record.getConfidence()));
            } catch (Exception ex) {
                log.warn("[AI审核] trackId={} FINISHED 推送异常", trackId, ex);
            }
            try {
                sseRegistry.complete(record.getId());
            } catch (Exception ex) {
                log.warn("[AI审核] trackId={} SSE complete 异常", trackId, ex);
            }

        } catch (Exception e) {
            log.error("[AI审核] trackId={} 审核流程异常", trackId, e);
            // 将已落库的审核记录标记为失败/异常(status=5)，避免永久卡在 status=0
            if (record != null && record.getId() != null) {
                try {
                    record.setStatus(5);
                    record.setFailReasons("审核流程异常: " + e.getClass().getSimpleName() + " - " + e.getMessage());
                    reviewRecordMapper.updateById(record);
                    log.info("[AI审核] trackId={} 已将审核记录标记为失败(status=5)", trackId);
                } catch (Exception ex) {
                    log.error("[AI审核] trackId={} 标记失败状态时再次异常", trackId, ex);
                }
                // 异常分支也要关闭 SSE 连接
                try {
                    sseRegistry.complete(record.getId());
                } catch (Exception ex) {
                    log.warn("[AI审核] trackId={} 异常分支 SSE complete 失败", trackId, ex);
                }
            }
        }
    }

    @Override
    public PageResult<ReviewListItemVO> listPending(Integer pageNum, Integer pageSize) {
        int current = pageNum == null || pageNum < 1 ? 1 : pageNum;
        int size = pageSize == null || pageSize < 1 ? 10 : (pageSize > 100 ? 100 : pageSize);
        Page<TrackReviewRecord> page = new Page<>(current, size);
        LambdaQueryWrapper<TrackReviewRecord> wrapper = new LambdaQueryWrapper<>();
        // 仅返回真正"待处理"的记录：status=1 (AI审核完成待自动处理) 与 status=3 (待人工确认)
        // 0/2/4/5 不在待处理列表中显示
        wrapper.in(TrackReviewRecord::getStatus, Arrays.asList(1, 3))
                .orderByDesc(TrackReviewRecord::getCreatedAt);
        reviewRecordMapper.selectPage(page, wrapper);

        List<ReviewListItemVO> list = page.getRecords().stream().map(r -> {
            ReviewListItemVO vo = new ReviewListItemVO();
            vo.setId(r.getId());
            vo.setTrackId(r.getTrackId());
            vo.setTrackTitle(r.getTrackTitle());
            vo.setVerdict(r.getVerdict());
            vo.setConfidence(r.getConfidence());
            vo.setFailReasons(r.getFailReasons());
            vo.setStatus(r.getStatus());
            vo.setCreatedAt(r.getCreatedAt());
            vo.setDimensionDetails(agentResultsFormatter.formatDimensions(r.getAgentResults()));
            return vo;
        }).collect(Collectors.toList());

        return new PageResult<>(page.getCurrent(), page.getSize(), page.getTotal(), page.getPages(), list);
    }

    @Override
    public void confirmReview(Long recordId, ReviewConfirmDTO dto, Long adminId) {
        // 1) 读 + 校验在事务外完成：避免长时间持有任何行锁
        TrackReviewRecord record = reviewRecordMapper.selectById(recordId);
        if (record == null) {
            throw new BusinessException(ResultCode.REVIEW_NOT_FOUND);
        }
        // 允许对任何状态的记录进行人工确认（admin override）：
        // - status=0 (AI审核中)：管理员可强制覆盖 AI 审核结果
        // - status=1 (高置信度待自动处理)：管理员可提前确认立即上架/下架
        // - status=2 (已自动处理)：管理员可重新确认以覆盖自动处理结果
        // - status=3 (低置信度待人工确认)：正常的人工确认流程
        // - status=4 (人工已确认)：管理员可更新之前的决定
        // - status=5 (失败/异常)：管理员可手动确认以覆盖失败结果
        // 防止 AI 审核覆盖管理员决定：triggerReview 中已加条件更新（仅当 status=0 时才更新）

        // 2) 仅把"两个 UPDATE"放进极短事务：行锁持有窗口从"整个方法执行时间"压缩到几毫秒，
        //    消除与异步 AI 审核的事务互相等待触发 lock_wait_timeout 的链路
        transactionTemplate.executeWithoutResult(status -> doConfirmInTx(record, dto, adminId));
    }

    /**
     * 极短事务内的真实写入：review 记录置为 status=4 并写管理员信息，再更新 Track.status。
     * 事务边界只覆盖这两个写操作 + 必要的 SELECT(用于查 Track)，
     * 不包含任何外部 IO / LLM 调用 / 日志刷盘，锁窗口在毫秒级。
     */
    private void doConfirmInTx(TrackReviewRecord record, ReviewConfirmDTO dto, Long adminId) {
        // 写入人工确认信息
        record.setAdminId(adminId);
        record.setAdminVerdict(dto.getAdminVerdict());
        record.setAdminNote(dto.getAdminNote());
        record.setReviewedAt(LocalDateTime.now());
        record.setStatus(4);
        reviewRecordMapper.updateById(record);

        // 根据 admin_verdict 更新 Track.status
        Track track = trackMapper.selectById(record.getTrackId());
        if (track != null) {
            if (dto.getAdminVerdict() == 1) {
                track.setStatus(0); // 正常
            } else {
                track.setStatus(1); // 已下架
            }
            trackMapper.updateById(track);
        }
    }
}
