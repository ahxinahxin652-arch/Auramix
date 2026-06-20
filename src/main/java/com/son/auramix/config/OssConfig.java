package com.son.auramix.config;

import com.aliyun.oss.OSS;
import com.aliyun.oss.OSSClientBuilder;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnExpression;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * 阿里云 OSS 客户端配置
 * <p>
 * 仅在配置了 endpoint / accessKeyId / accessKeySecret / bucketName 后才创建 OSS 客户端 Bean。
 */
@Slf4j
@Configuration
@RequiredArgsConstructor
public class OssConfig {

    private final OssProperties ossProperties;

    @Bean(destroyMethod = "shutdown")
    @ConditionalOnExpression(
        "!T(org.springframework.util.StringUtils).isEmpty('${aliyun.oss.endpoint:}') and " +
        "!T(org.springframework.util.StringUtils).isEmpty('${aliyun.oss.access-key-id:}') and " +
        "!T(org.springframework.util.StringUtils).isEmpty('${aliyun.oss.access-key-secret:}') and " +
        "!T(org.springframework.util.StringUtils).isEmpty('${aliyun.oss.bucket-name:}')"
    )
    public OSS ossClient() {
        log.info("[OssConfig] 初始化 OSS 客户端, endpoint={}, bucket={}", ossProperties.getEndpoint(), ossProperties.getBucketName());
        return new OSSClientBuilder().build(
                ossProperties.getEndpoint(),
                ossProperties.getAccessKeyId(),
                ossProperties.getAccessKeySecret()
        );
    }
}
