package com.son.auramix.service.python;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.son.auramix.domain.entity.TrackAudioFeature;
import com.son.auramix.mapper.TrackAudioFeatureMapper;
import com.son.auramix.util.PythonRunner;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.io.InputStream;
import java.math.BigDecimal;
import java.net.URI;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;

/**
 * 音频特征分析服务
 * 调用 Python librosa 脚本，解析结果并写入数据库
 */
@Slf4j
@Service
public class AudioFeatureService {

    private final TrackAudioFeatureMapper audioFeatureMapper;
    private final ObjectMapper objectMapper;

    @Value("${auramix.audio.script-path:scripts/audio_analyzer.py}")
    private String scriptPath;

    public AudioFeatureService(TrackAudioFeatureMapper audioFeatureMapper, ObjectMapper objectMapper) {
        this.audioFeatureMapper = audioFeatureMapper;
        this.objectMapper = objectMapper;
    }

    /**
     * 分析音频文件并将特征存入数据库
     *
     * @param trackId       曲目 ID
     * @param audioFilePath 音频文件路径（本地路径或 HTTP URL）
     * @return 分析结果
     */
    public TrackAudioFeature analyzeAndSave(Long trackId, String audioFilePath) {
        try {
            String localPath = resolveLocalPath(audioFilePath);
            try {
                return doAnalyzeAndSave(trackId, localPath);
            } finally {
                cleanupTempFile(localPath, audioFilePath);
            }
        } catch (Exception e) {
            log.error("音频分析失败: trackId={}", trackId, e);
            throw new RuntimeException("音频特征分析失败: " + e.getMessage(), e);
        }
    }

    /**
     * 仅分析不存储，返回分析结果
     */
    public TrackAudioFeature analyzeOnly(Long trackId, String audioFilePath) {
        try {
            String localPath = resolveLocalPath(audioFilePath);
            try {
                return doAnalyzeOnly(trackId, localPath);
            } finally {
                cleanupTempFile(localPath, audioFilePath);
            }
        } catch (Exception e) {
            log.error("音频分析失败: trackId={}", trackId, e);
            throw new RuntimeException("音频特征分析失败: " + e.getMessage(), e);
        }
    }

    /**
     * 将 URL 下载到临时文件，返回本地路径
     */
    private String resolveLocalPath(String audioFilePath) throws IOException {
        if (audioFilePath == null) {
            throw new IllegalArgumentException("audioFilePath 不能为 null");
        }
        // 本地路径直接返回
        if (!audioFilePath.startsWith("http://") && !audioFilePath.startsWith("https://")) {
            return audioFilePath;
        }
        // 从 URL 提取文件名（去掉 query 参数）
        String urlPath = URI.create(audioFilePath).getPath();
        String fileName = urlPath.substring(urlPath.lastIndexOf('/') + 1);
        if (fileName.isBlank()) {
            fileName = "audio_tmp.mp3";
        }
        // 确保有扩展名，librosa 依赖扩展名选择解码器
        if (!fileName.contains(".")) {
            fileName += ".mp3";
        }

        Path tempFile = Files.createTempFile("auramix_", "_" + fileName);
        log.info("下载音频到临时文件: {} -> {}", audioFilePath, tempFile);
        try (InputStream in = URI.create(audioFilePath).toURL().openStream()) {
            Files.copy(in, tempFile, StandardCopyOption.REPLACE_EXISTING);
        }
        log.info("下载完成: {} ({} bytes)", tempFile, Files.size(tempFile));
        return tempFile.toAbsolutePath().toString();
    }

    /**
     * 清理通过 URL 下载的临时文件
     */
    private void cleanupTempFile(String localPath, String originalPath) {
        if (originalPath != null && (originalPath.startsWith("http://") || originalPath.startsWith("https://"))) {
            try {
                Files.deleteIfExists(Path.of(localPath));
                log.debug("已清理临时文件: {}", localPath);
            } catch (IOException e) {
                log.warn("清理临时文件失败: {}", localPath, e);
            }
        }
    }

    private TrackAudioFeature doAnalyzeAndSave(Long trackId, String localPath) throws Exception {
        log.info("开始分析音频: trackId={}, file={}", trackId, localPath);
        String jsonOutput = PythonRunner.run(scriptPath, localPath);

        JsonNode root = objectMapper.readTree(jsonOutput);
        if (root.has("error")) {
            throw new RuntimeException("Python 脚本错误: " + root.get("error").asText());
        }

        TrackAudioFeature feature = mapToEntity(trackId, root);

        TrackAudioFeature existing = audioFeatureMapper.selectById(trackId);
        if (existing != null) {
            audioFeatureMapper.updateById(feature);
            log.info("更新音频特征: trackId={}", trackId);
        } else {
            audioFeatureMapper.insert(feature);
            log.info("新增音频特征: trackId={}", trackId);
        }

        return feature;
    }

    private TrackAudioFeature doAnalyzeOnly(Long trackId, String localPath) throws Exception {
        String jsonOutput = PythonRunner.run(scriptPath, localPath);
        JsonNode root = objectMapper.readTree(jsonOutput);
        return mapToEntity(trackId, root);
    }

    private TrackAudioFeature mapToEntity(Long trackId, JsonNode root) {
        TrackAudioFeature feature = new TrackAudioFeature();
        feature.setTrackId(trackId);
        feature.setTempo(bd(root, "tempo"));
        feature.setMusicalKey(root.get("musical_key").asInt());
        feature.setMusicalMode(root.get("musical_mode").asInt());
        feature.setTimeSignature(root.get("time_signature").asInt());
        feature.setValence(bd(root, "valence"));
        feature.setArousal(bd(root, "arousal"));
        feature.setEnergy(bd(root, "energy"));
        feature.setDanceability(bd(root, "danceability"));
        feature.setAcousticness(bd(root, "acousticness"));
        feature.setInstrumentalness(bd(root, "instrumentalness"));
        feature.setMfccVector(root.get("mfcc_vector").toString());
        feature.setVersion(root.get("version").asInt());
        feature.setUpdatedAt(LocalDateTime.now());
        return feature;
    }

    private BigDecimal bd(JsonNode node, String field) {
        return BigDecimal.valueOf(node.get(field).asDouble());
    }
}
