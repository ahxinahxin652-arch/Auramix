package com.son.auramix.aspect;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.son.auramix.annotation.AnalyzeAudio;
import com.son.auramix.common.result.Result;
import com.son.auramix.domain.dto.admin.TrackAudioResourceDto;
import com.son.auramix.domain.dto.admin.TrackCreateDTO;
import com.son.auramix.domain.dto.admin.TrackUpdateDTO;
import com.son.auramix.mapper.TrackAudioFeatureMapper;
import com.son.auramix.service.python.AudioFeatureService;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.AfterReturning;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Pointcut;
import org.aspectj.lang.reflect.MethodSignature;
import org.springframework.stereotype.Component;
import org.springframework.web.bind.annotation.PathVariable;

import java.lang.annotation.Annotation;
import java.lang.reflect.Parameter;
import java.util.List;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.Executor;

/**
 * 音频特征分析切面
 * 监听 @AnalyzeAudio 注解，在方法成功返回后异步触发音频特征分析
 */
@Aspect
@Slf4j
@Component
public class AudioAnalysisAspect {

    private final AudioFeatureService audioFeatureService;
    private final TrackAudioFeatureMapper trackAudioFeatureMapper;
    private final Executor reviewTaskExecutor;

    public AudioAnalysisAspect(AudioFeatureService audioFeatureService,
                               TrackAudioFeatureMapper trackAudioFeatureMapper,
                               @org.springframework.beans.factory.annotation.Qualifier("reviewTaskExecutor") Executor reviewTaskExecutor) {
        this.audioFeatureService = audioFeatureService;
        this.trackAudioFeatureMapper = trackAudioFeatureMapper;
        this.reviewTaskExecutor = reviewTaskExecutor;
    }

    @Pointcut("@annotation(com.son.auramix.annotation.AnalyzeAudio)")
    public void analyzeAudioPointcut() {}

    @AfterReturning(pointcut = "analyzeAudioPointcut()", returning = "result")
    public void afterReturning(JoinPoint joinPoint, Object result) {
        try {
            // 1. 从返回值或方法参数中提取 trackId
            Long trackId = extractTrackId(joinPoint, result);
            if (trackId == null) {
                log.warn("[音频分析] 无法从返回值中提取 trackId，跳过");
                return;
            }

            // 2. 从方法参数中提取 audioFilePath
            String audioFilePath = extractAudioFilePath(joinPoint);

            if (audioFilePath != null && !audioFilePath.isBlank()) {
                // 有音频路径 -> 创建或更新操作，异步执行音频分析
                CompletableFuture.runAsync(() -> {
                    try {
                        log.info("[音频分析] 开始异步分析 trackId={}, file={}", trackId, audioFilePath);
                        audioFeatureService.analyzeAndSave(trackId, audioFilePath);
                        log.info("[音频分析] 完成 trackId={}", trackId);
                    } catch (Exception e) {
                        log.error("[音频分析] 分析失败 trackId={}", trackId, e);
                    }
                }, reviewTaskExecutor);
            } else {
                // 无音频路径 -> 删除操作，删除对应的音频特征记录
                CompletableFuture.runAsync(() -> {
                    try {
                        log.info("[音频分析] 开始删除音频特征 trackId={}", trackId);
                        trackAudioFeatureMapper.delete(
                                new LambdaQueryWrapper<com.son.auramix.domain.entity.TrackAudioFeature>()
                                        .eq(com.son.auramix.domain.entity.TrackAudioFeature::getTrackId, trackId));
                        log.info("[音频分析] 已删除音频特征 trackId={}", trackId);
                    } catch (Exception e) {
                        log.error("[音频分析] 删除音频特征失败 trackId={}", trackId, e);
                    }
                }, reviewTaskExecutor);
            }

        } catch (Exception e) {
            log.error("[音频分析] 切面执行异常", e);
        }
    }

    /**
     * 从返回值或方法参数中提取 trackId
     * - 创建接口（create）: Result\<Long\> 返回值
     * - 更新接口（update）: @PathVariable Long id 参数
     */
    private Long extractTrackId(JoinPoint joinPoint, Object result) {
        // 优先从返回值提取（create 接口返回 Result<Long>）
        if (result instanceof Result<?> r) {
            Object data = r.getData();
            if (data instanceof Long longVal) {
                return longVal;
            }
        }

        // 从方法参数中提取 @PathVariable 注解的 Long 参数（update 接口）
        Parameter[] parameters = ((MethodSignature) joinPoint.getSignature()).getMethod().getParameters();
        Object[] args = joinPoint.getArgs();
        for (int i = 0; i < parameters.length; i++) {
            for (Annotation annotation : parameters[i].getAnnotations()) {
                if (annotation instanceof PathVariable && args[i] instanceof Long longVal) {
                    return longVal;
                }
            }
        }

        return null;
    }

    /**
     * 从方法参数中提取音频文件路径
     * 支持 TrackCreateDTO 和 TrackUpdateDTO
     */
    private String extractAudioFilePath(JoinPoint joinPoint) {
        for (Object arg : joinPoint.getArgs()) {
            String url = null;

            if (arg instanceof TrackCreateDTO dto) {
                url = extractFirstStreamUrl(dto.getAudioResources());
            } else if (arg instanceof TrackUpdateDTO dto) {
                url = extractFirstStreamUrl(dto.getAudioResources());
            }

            if (url != null) {
                return url;
            }
        }
        return null;
    }

    /**
     * 从资源列表中取第一条 streamUrl
     */
    private String extractFirstStreamUrl(List<TrackAudioResourceDto> audioResources) {
        if (audioResources != null && !audioResources.isEmpty()) {
            TrackAudioResourceDto first = audioResources.get(0);
            if (first.getStreamUrl() != null && !first.getStreamUrl().isBlank()) {
                return first.getStreamUrl();
            }
        }
        return null;
    }
}
