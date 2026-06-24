package com.son.auramix.domain.dto.admin;

import lombok.Data;

@Data
public class OssPolicyResponse {
    private String accessKeyId;
    private String policy;
    private String signature;
    private String dir;
    private String host;
    private Long expire;
}
