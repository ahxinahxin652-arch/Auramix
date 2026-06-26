package com.son.auramix.ai.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 审核流水线上下文，携带全量审核内容
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReviewContext {

    private Long trackId;
    private String trackTitle;
    private String artistNames;
    private String albumTitle;
    private String lyricsContent;

    /** 是否包含有效歌词内容（非空且不仅仅是 LRC 元标签） */
    private boolean hasLyrics;

    /** 审核类型标识，用于扩展: TEXT_ONLY / TEXT_AUDIO / AUDIO_ONLY */
    private String reviewType;
}
