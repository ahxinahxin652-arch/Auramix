package com.son.auramix.domain.dto.analytics;

import lombok.Data;

@Data
public class AnalyzeRequest {
    private Long trackId;
    private String audioFilePath;
}
