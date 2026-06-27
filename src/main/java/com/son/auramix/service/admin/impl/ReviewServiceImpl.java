package com.son.auramix.service.admin.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.son.auramix.ai.dto.AgentResult;
import com.son.auramix.ai.dto.ReviewContext;
import com.son.auramix.ai.lyrics.LyricsFetcher;
import com.son.auramix.ai.orchestrator.ReviewOrchestrator;
import com.son.auramix.common.exception.BusinessException;
import com.son.auramix.common.result.PageResult;
import com.son.auramix.common.result.ResultCode;
import com.son.auramix.domain.dto.admin.ReviewConfirmDTO;
import com.son.auramix.domain.entity.*;
import com.son.auramix.domain.vo.admin.ReviewListItemVO;
import com.son.auramix.mapper.*;
import com.son.auramix.service.admin.ReviewService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
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

    @Override
    @Async("reviewTaskExecutor")
    public void triggerReview(Long trackId) {
        log.info("[AI审核] trackId={} 开始触发审核", trackId);
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

            // 拉取歌词
            String lyricsContent = lyricsFetcher.fetch(track.getLyricsUrl());
            boolean hasLyrics = lyricsFetcher.hasValidLyrics(lyricsContent);

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

            // 先创建审核记录（status=0, AI审核中）
            TrackReviewRecord record = new TrackReviewRecord();
            record.setTrackId(trackId);
            record.setTrackTitle(track.getTitle());
            record.setArtistNames(artistNames);
            record.setAlbumTitle(albumTitle);
            record.setLyricsContent(lyricsContent);
            record.setVerdict(0);
            record.setConfidence(0);
            record.setStatus(0);
            reviewRecordMapper.insert(record);

            // 执行审核流水线
            ReviewOrchestrator.PipelineResult pipeline = orchestrator.execute(ctx);
            List<AgentResult> dimensionResults = pipeline.getDimensionResults();
            AgentResult finalResult = pipeline.getFinalResult();

            // 构建 agent_results JSON
            String agentResultsJson = orchestrator.buildAgentResultsJson(dimensionResults, finalResult);

            // 更新审核记录
            record.setAgentResults(agentResultsJson);
            record.setConfidence(finalResult.getConfidence());
            record.setFailReasons(finalResult.getReason());

            int confidence = finalResult.getConfidence();
            boolean isFail = finalResult.isFail();

            if (confidence >= 80) {
                // 高置信度 → 待自动处理
                record.setVerdict(isFail ? -1 : 1);
                record.setStatus(1);
            } else {
                // 低置信度 → 待人工确认
                record.setVerdict(-2);
                record.setStatus(3);
            }

            reviewRecordMapper.updateById(record);
            log.info("[AI审核] trackId={} 最终裁决 verdict={} confidence={} status={}",
                    trackId, record.getVerdict(), confidence, record.getStatus());

        } catch (Exception e) {
            log.error("[AI审核] trackId={} 审核流程异常", trackId, e);
        }
    }

    @Override
    public PageResult<ReviewListItemVO> listPending(Integer pageNum, Integer pageSize) {
        int current = pageNum == null || pageNum < 1 ? 1 : pageNum;
        int size = pageSize == null || pageSize < 1 ? 10 : (pageSize > 100 ? 100 : pageSize);
        Page<TrackReviewRecord> page = new Page<>(current, size);
        LambdaQueryWrapper<TrackReviewRecord> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(TrackReviewRecord::getStatus, 3);
        wrapper.orderByDesc(TrackReviewRecord::getCreatedAt);
        reviewRecordMapper.selectPage(page, wrapper);

        List<ReviewListItemVO> list = page.getRecords().stream().map(r -> {
            ReviewListItemVO vo = new ReviewListItemVO();
            vo.setId(r.getId());
            vo.setTrackId(r.getTrackId());
            vo.setTrackTitle(r.getTrackTitle());
            vo.setVerdict(r.getVerdict());
            vo.setConfidence(r.getConfidence());
            vo.setFailReasons(r.getFailReasons());
            vo.setCreatedAt(r.getCreatedAt());
            return vo;
        }).collect(Collectors.toList());

        return new PageResult<>(page.getCurrent(), page.getSize(), page.getTotal(), page.getPages(), list);
    }

    @Override
    @Transactional
    public void confirmReview(Long recordId, ReviewConfirmDTO dto, Long adminId) {
        TrackReviewRecord record = reviewRecordMapper.selectById(recordId);
        if (record == null) {
            throw new BusinessException(ResultCode.REVIEW_NOT_FOUND);
        }
        if (record.getStatus() != 3) {
            throw new BusinessException(ResultCode.REVIEW_NOT_PENDING);
        }

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
