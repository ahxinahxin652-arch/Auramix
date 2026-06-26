package com.son.auramix.domain.vo.admin;

import lombok.Data;

@Data
public class OssPolicyVO {
    private String accessKeyId;
    private String policy;
    private String signature;
    private String dir;
    private String host;
    private Long expire;
}
