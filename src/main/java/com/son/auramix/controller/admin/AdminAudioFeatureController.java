package com.son.auramix.controller.admin;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.son.auramix.common.result.Result;
import com.son.auramix.domain.dto.analytics.AnalyzeRequest;
import com.son.auramix.domain.entity.Track;
import com.son.auramix.domain.entity.TrackAudioFeature;
import com.son.auramix.domain.entity.TrackAudioResource;
import com.son.auramix.mapper.TrackAudioFeatureMapper;
import com.son.auramix.mapper.TrackAudioResourceMapper;
import com.son.auramix.mapper.TrackMapper;
import com.son.auramix.service.python.AudioFeatureService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

/**
 * 音频特征分析接口
 */
@Slf4j
@RestController
@RequestMapping("/api/admin/audio-feature")
@RequiredArgsConstructor
public class AdminAudioFeatureController {

    private final AudioFeatureService audioFeatureService;
    private final TrackAudioFeatureMapper audioFeatureMapper;
    private final TrackMapper trackMapper;
    private final TrackAudioResourceMapper audioResourceMapper;

    /**
     * 分析音频并存入数据库
     *
     * POST /api/admin/audio-feature/analyze
     * Body: {"trackId": 123, "audioFilePath": "/path/to/music.mp3"}
     */
    @PostMapping("/analyze")
    public Result<TrackAudioFeature> analyze(@RequestBody AnalyzeRequest request) {
        TrackAudioFeature feature = audioFeatureService.analyzeAndSave(
                request.getTrackId(), request.getAudioFilePath());
        return Result.success(feature);
    }

    /**
     * 仅分析不存储（预览）
     */
    @PostMapping("/preview")
    public Result<TrackAudioFeature> preview(@RequestBody AnalyzeRequest request) {
        TrackAudioFeature feature = audioFeatureService.analyzeOnly(
                request.getTrackId(), request.getAudioFilePath());
        return Result.success(feature);
    }

    /**
     * 查看某首曲目的特征
     */
    @GetMapping("/{trackId}")
    public Result<TrackAudioFeature> get(@PathVariable Long trackId) {
        TrackAudioFeature feature = audioFeatureMapper.selectById(trackId);
        if (feature == null) {
            return Result.error("未找到该曲目的音频特征");
        }
        return Result.success(feature);
    }

    /**
     * 对所有未进行音频分析的歌曲批量执行分析
     *
     * POST /api/admin/audio-feature/analyze-all
     */
    @PostMapping("/analyze-all")
    public Result<Map<String, Object>> analyzeAll() {
        // 1. 查找所有已有音频特征的 trackId
        Set<Long> analyzedTrackIds = audioFeatureMapper.selectList(null)
                .stream()
                .map(TrackAudioFeature::getTrackId)
                .collect(Collectors.toSet());

        // 2. 查找所有正常状态的 track
        List<Track> allTracks = trackMapper.selectList(
                new LambdaQueryWrapper<Track>().eq(Track::getStatus, 0));

        // 3. 筛选未分析的 tracks
        List<Track> unanalyzedTracks = allTracks.stream()
                .filter(t -> !analyzedTrackIds.contains(t.getId()))
                .toList();

        if (unanalyzedTracks.isEmpty()) {
            Map<String, Object> result = new HashMap<>();
            result.put("total", 0);
            result.put("success", 0);
            result.put("fail", 0);
            result.put("skipped", 0);
            return Result.success(result);
        }

        // 4. 同步逐条分析，全部完成后返回
        List<Track> trackList = new ArrayList<>(unanalyzedTracks);
        int success = 0, fail = 0, skipped = 0;
        for (Track track : trackList) {
            try {
                TrackAudioResource resource = getFirstAudioResource(track.getId());
                if (resource == null) {
                    log.warn("[批量分析] 歌曲 trackId={} 没有音源资源，跳过", track.getId());
                    skipped++;
                    continue;
                }
                log.info("[批量分析] 正在分析 trackId={}, title={} ({}/{})", track.getId(), track.getTitle(), success + fail + skipped + 1, trackList.size());
                audioFeatureService.analyzeAndSave(track.getId(), resource.getStreamUrl());
                success++;
                log.info("[批量分析] 分析完成 trackId={}", track.getId());
            } catch (Exception e) {
                fail++;
                log.error("[批量分析] 分析失败 trackId={}", track.getId(), e);
            }
        }
        log.info("[批量分析] 全部完成, 成功={}, 失败={}, 跳过={}, 总计={}", success, fail, skipped, trackList.size());

        Map<String, Object> result = new HashMap<>();
        result.put("total", trackList.size());
        result.put("success", success);
        result.put("fail", fail);
        result.put("skipped", skipped);
        return Result.success(result);
    }

    /**
     * 获取歌曲的第一个有效音源资源
     */
    private TrackAudioResource getFirstAudioResource(Long trackId) {
        List<TrackAudioResource> resources = audioResourceMapper.selectList(
                new LambdaQueryWrapper<TrackAudioResource>()
                        .eq(TrackAudioResource::getTrackId, trackId)
                        .isNotNull(TrackAudioResource::getStreamUrl)
                        .ne(TrackAudioResource::getStreamUrl, "")
                        .last("LIMIT 1"));
        return resources.isEmpty() ? null : resources.get(0);
    }
}
