package com.son.auramix.ai.lyrics;

import cn.hutool.http.HttpUtil;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

/**
 * 拉取 lyrics_url 并返回歌词文本
 */
@Slf4j
@Component
public class LyricsFetcher {

    private static final int TIMEOUT_MS = 10_000;

    /**
     * 拉取歌词内容，失败返回 null。
     * <p>
     * 返回前会清洗 LRC 时间标签/元信息标签，避免无效内容污染 LLM prompt。
     */
    public String fetch(String lyricsUrl) {
        if (lyricsUrl == null || lyricsUrl.isBlank()) {
            return null;
        }
        try {
            String content = HttpUtil.get(lyricsUrl, TIMEOUT_MS);
            if (content == null || content.isBlank()) {
                return null;
            }
            return cleanLrcTags(content);
        } catch (Exception e) {
            log.warn("[AI审核] 歌词拉取失败 url={} err={}", lyricsUrl, e.getMessage());
            return null;
        }
    }

    /**
     * 移除 LRC 时间标签和元信息标签，保留纯文本歌词。
     */
    private String cleanLrcTags(String content) {
        return content
                .replaceAll("\\[\\w+:.*?]", "")
                .replaceAll("\\[\\d{2}:\\d{2}\\.?\\d*]", "")
                .trim();
    }

    /**
     * 判断歌词内容是否有效（非空且不仅仅是 LRC 元标签）
     */
    public boolean hasValidLyrics(String content) {
        if (content == null || content.isBlank()) {
            return false;
        }
        // 移除所有 LRC 时间标签和元信息标签后判断是否有实际文本
        String stripped = content
                .replaceAll("\\[\\w+:.*?]", "")
                .replaceAll("\\[\\d{2}:\\d{2}\\.?\\d*]", "")
                .trim();
        return !stripped.isEmpty();
    }
}
