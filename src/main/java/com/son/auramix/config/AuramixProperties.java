package com.son.auramix.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

/**
 * Auramix 内部配置属性
 */
@Data
@Component
@ConfigurationProperties(prefix = "auramix")
public class AuramixProperties {

    /** 内部 API Key — 用于服务间调用（桌面端 Express → Java 后端） */
    private String internalApiKey;
}
