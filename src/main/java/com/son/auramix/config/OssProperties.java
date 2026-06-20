package com.son.auramix.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

/**
 * 阿里云 OSS 配置属性
 */
@Data
@Component
@ConfigurationProperties(prefix = "aliyun.oss")
public class OssProperties {

    /** 地域节点，例: oss-cn-hangzhou.aliyuncs.com */
    private String endpoint;

    /** AccessKey ID */
    private String accessKeyId;

    /** AccessKey Secret */
    private String accessKeySecret;

    /** Bucket 名称 */
    private String bucketName;

    /** 自定义域名(CDN加速域名)，选填，设置后签名URL/公网URL会使用此域名 */
    private String customDomain;

    /** 签名URL默认过期时间(秒)，默认 3600 */
    private Long signedUrlExpireSeconds = 3600L;
}
