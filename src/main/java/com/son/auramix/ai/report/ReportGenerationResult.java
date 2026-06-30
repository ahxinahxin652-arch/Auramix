package com.son.auramix.ai.report;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Collections;
import java.util.List;

/**
 * 报告生成结果 (LLM 输出反序列化).
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReportGenerationResult {
    private String summary;
    private List<String> moodTags;
    private List<String> highlights;
    private List<String> recommendations;

    public static ReportGenerationResult empty() {
        return new ReportGenerationResult(
                "本周期暂无足够听歌数据，稍后再来看看吧。",
                Collections.emptyList(),
                Collections.emptyList(),
                Collections.emptyList()
        );
    }
}