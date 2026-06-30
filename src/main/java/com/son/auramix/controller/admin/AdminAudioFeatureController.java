package com.son.auramix.controller.admin;

import com.son.auramix.common.result.Result;
import com.son.auramix.domain.dto.analytics.AnalyzeRequest;
import com.son.auramix.domain.entity.TrackAudioFeature;
import com.son.auramix.mapper.TrackAudioFeatureMapper;
import com.son.auramix.service.python.AudioFeatureService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

/**
 * 音频特征分析接口
 */
@RestController
@RequestMapping("/api/admin/audio-feature")
@RequiredArgsConstructor
public class AdminAudioFeatureController {

    private final AudioFeatureService audioFeatureService;
    private final TrackAudioFeatureMapper audioFeatureMapper;

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
}
