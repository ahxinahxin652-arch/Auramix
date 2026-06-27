package com.son.auramix.service.oss;

import cn.hutool.core.io.IoUtil;
import cn.hutool.core.util.IdUtil;
import cn.hutool.core.util.StrUtil;
import com.aliyun.oss.OSS;
import com.aliyun.oss.model.*;
import com.son.auramix.config.OssProperties;
import com.son.auramix.domain.vo.admin.OssPolicyVO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnBean;
import org.springframework.stereotype.Service;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.net.URL;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Date;
import java.util.List;

/**
 * 阿里云 OSS 文件存储服务
 * <p>
 * 提供文件上传、下载、删除、签名URL生成等操作。
 * 仅当 OSS 客户端 Bean 存在时生效。
 */
@Slf4j
@Service
@RequiredArgsConstructor
@ConditionalOnBean(OSS.class)
public class OssService {

    private final OSS ossClient;
    private final OssProperties ossProperties;

    /** 日期格式化器，用于按日期分目录存储 */
    private static final DateTimeFormatter DATE_DIR = DateTimeFormatter.ofPattern("yyyy/MM/dd");

    // ============================ 上传 ============================

    /**
     * 上传文件（InputStream）
     *
     * @param inputStream 文件输入流
     * @param originalFilename 原始文件名，用于提取扩展名
     * @param dir 存储目录前缀，例: "audio", "image", "video"
     * @return 上传结果(OSS key, URL)
     */
    public OssUploadResult upload(InputStream inputStream, String originalFilename, String dir) throws IOException {
        byte[] bytes = IoUtil.readBytes(inputStream);
        return upload(bytes, originalFilename, dir);
    }

    /**
     * 上传文件（byte 数组）
     *
     * @param bytes 文件字节数组
     * @param originalFilename 原始文件名
     * @param dir 存储目录前缀
     * @return 上传结果
     */
    public OssUploadResult upload(byte[] bytes, String originalFilename, String dir) {
        String objectKey = buildObjectKey(dir, originalFilename);
        String contentType = resolveContentType(originalFilename);

        ObjectMetadata metadata = new ObjectMetadata();
        metadata.setContentLength(bytes.length);
        metadata.setContentType(contentType);

        PutObjectResult result = ossClient.putObject(
                ossProperties.getBucketName(),
                objectKey,
                new ByteArrayInputStream(bytes),
                metadata
        );

        String url = buildAccessUrl(objectKey);

        log.info("[OssService] 上传成功, key={}, size={}, eTag={}", objectKey, bytes.length, result.getETag());
        return new OssUploadResult(objectKey, url, bytes.length, result.getETag());
    }

    /**
     * 上传本地文件
     *
     * @param filePath 本地文件路径
     * @param dir 存储目录前缀
     * @return 上传结果
     */
    public OssUploadResult upload(Path filePath, String dir) throws IOException {
        byte[] bytes = Files.readAllBytes(filePath);
        return upload(bytes, filePath.getFileName().toString(), dir);
    }

    // ============================ 删除 ============================

    /**
     * 删除单个文件
     *
     * @param objectKey OSS 对象 key
     */
    public void delete(String objectKey) {
        ossClient.deleteObject(ossProperties.getBucketName(), objectKey);
        log.info("[OssService] 删除文件, key={}", objectKey);
    }

    /**
     * 批量删除文件
     *
     * @param objectKeys OSS 对象 key 列表
     * @return 已删除的文件 key 列表
     */
    public List<String> deleteBatch(List<String> objectKeys) {
        DeleteObjectsRequest request = new DeleteObjectsRequest(ossProperties.getBucketName())
                .withKeys(objectKeys)
                .withQuiet(false);
        DeleteObjectsResult result = ossClient.deleteObjects(request);
        List<String> deleted = result.getDeletedObjects();
        log.info("[OssService] 批量删除, count={}", deleted.size());
        return deleted;
    }

    // ============================ 查询 ============================

    /**
     * 判断文件是否存在
     */
    public boolean exists(String objectKey) {
        return ossClient.doesObjectExist(ossProperties.getBucketName(), objectKey);
    }

    /**
     * 获取文件元信息
     *
     * @return ObjectMetadata，文件不存在返回 null
     */
    public ObjectMetadata getObjectMetadata(String objectKey) {
        if (!exists(objectKey)) {
            return null;
        }
        return ossClient.getObjectMetadata(ossProperties.getBucketName(), objectKey);
    }

    /**
     * 列出目录下文件
     *
     * @param prefix 目录前缀，例: "audio/2026/06/"
     * @param maxKeys 最大返回数量
     * @return 文件摘要列表
     */
    public List<OSSObjectSummary> listObjects(String prefix, int maxKeys) {
        ObjectListing listing = ossClient.listObjects(
                new ListObjectsRequest(ossProperties.getBucketName())
                        .withPrefix(prefix)
                        .withMaxKeys(maxKeys)
        );
        return listing.getObjectSummaries();
    }

    // ============================ 下载 ============================

    /**
     * 下载文件到字节数组
     *
     * @param objectKey OSS 对象 key
     * @return 文件字节数组
     */
    public byte[] download(String objectKey) throws IOException {
        OSSObject ossObject = ossClient.getObject(ossProperties.getBucketName(), objectKey);
        try (InputStream in = ossObject.getObjectContent()) {
            return IoUtil.readBytes(in);
        }
    }

    /**
     * 下载文件到本地路径
     */
    public void downloadToFile(String objectKey, Path targetPath) throws IOException {
        byte[] bytes = download(objectKey);
        Files.createDirectories(targetPath.getParent());
        Files.write(targetPath, bytes);
        log.info("[OssService] 下载文件到本地, key={}, path={}", objectKey, targetPath);
    }

    // ============================ URL ============================

    /**
     * 生成签名URL（临时访问，默认1小时过期）
     *
     * @param objectKey OSS 对象 key
     * @return 签名URL
     */
    public String generateSignedUrl(String objectKey) {
        return generateSignedUrl(objectKey, ossProperties.getSignedUrlExpireSeconds());
    }

    /**
     * 生成签名URL（指定过期时间）
     *
     * @param objectKey  OSS 对象 key
     * @param expireSeconds 过期时间(秒)
     * @return 签名URL
     */
    public String generateSignedUrl(String objectKey, long expireSeconds) {
        Date expiration = new Date(System.currentTimeMillis() + expireSeconds * 1000);
        URL url = ossClient.generatePresignedUrl(
                ossProperties.getBucketName(), objectKey, expiration
        );
        // 如果配置了自定义域名，替换 endpoint 部分
        if (StrUtil.isNotBlank(ossProperties.getCustomDomain())) {
            return url.toString().replace(
                    ossProperties.getBucketName() + "." + ossProperties.getEndpoint(),
                    ossProperties.getCustomDomain()
            );
        }
        return url.toString();
    }

    /**
     * 获取文件公网访问URL（Bucket为公共读时才可直接访问）
     *
     * @param objectKey OSS 对象 key
     * @return 公网URL
     */
    public String getPublicUrl(String objectKey) {
        if (StrUtil.isNotBlank(ossProperties.getCustomDomain())) {
            return String.format("https://%s/%s", ossProperties.getCustomDomain(), objectKey);
        }
        return String.format("https://%s.%s/%s",
                ossProperties.getBucketName(), ossProperties.getEndpoint(), objectKey);
    }

    /**
     * 生成 Post Policy 上传凭证
     */
    public OssPolicyVO generatePostPolicy(String dir) {
        long expireTime = 300; // 5分钟有效期
        long expireEndTime = System.currentTimeMillis() + expireTime * 1000;
        Date expiration = new Date(expireEndTime);
        
        PolicyConditions policyConds = new PolicyConditions();
        policyConds.addConditionItem(PolicyConditions.COND_CONTENT_LENGTH_RANGE, 0, 1048576000); // 最大1GB
        policyConds.addConditionItem(MatchMode.StartWith, PolicyConditions.COND_KEY, dir);

        String postPolicy = ossClient.generatePostPolicy(expiration, policyConds);
        byte[] binaryData = postPolicy.getBytes(java.nio.charset.StandardCharsets.UTF_8);
        String encodedPolicy = cn.hutool.core.codec.Base64.encode(binaryData);
        String postSignature = ossClient.calculatePostSignature(postPolicy);

        OssPolicyVO response = new OssPolicyVO();
        response.setAccessKeyId(ossProperties.getAccessKeyId());
        response.setPolicy(encodedPolicy);
        response.setSignature(postSignature);
        response.setDir(dir);
        response.setHost("https://" + ossProperties.getBucketName() + "." + ossProperties.getEndpoint());
        response.setExpire(expireEndTime / 1000);
        return response;
    }

    // ============================ 私有方法 ============================

    /**
     * 构建 OSS 对象 Key，格式: {dir}/{yyyy/MM/dd}/{uuid}.{ext}
     */
    private String buildObjectKey(String dir, String originalFilename) {
        String dateDir = LocalDate.now().format(DATE_DIR);
        String ext = StrUtil.isNotBlank(originalFilename) && originalFilename.contains(".")
                ? originalFilename.substring(originalFilename.lastIndexOf("."))
                : "";
        String uuid = IdUtil.fastSimpleUUID();
        return String.format("%s/%s/%s%s", StrUtil.removeSuffix(dir, "/"), dateDir, uuid, ext);
    }

    /**
     * 构建文件访问URL（使用公网URL，避免数据库存储的URL带过期时间）
     */
    private String buildAccessUrl(String objectKey) {
        return getPublicUrl(objectKey);
    }

    /**
     * 根据文件名后缀解析 Content-Type
     */
    private String resolveContentType(String filename) {
        if (StrUtil.isBlank(filename)) {
            return "application/octet-stream";
        }
        String lower = filename.toLowerCase();
        // 图片
        if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) return "image/jpeg";
        if (lower.endsWith(".png")) return "image/png";
        if (lower.endsWith(".gif")) return "image/gif";
        if (lower.endsWith(".webp")) return "image/webp";
        if (lower.endsWith(".bmp")) return "image/bmp";
        if (lower.endsWith(".svg")) return "image/svg+xml";
        // 音频
        if (lower.endsWith(".mp3")) return "audio/mpeg";
        if (lower.endsWith(".wav")) return "audio/wav";
        if (lower.endsWith(".flac")) return "audio/flac";
        if (lower.endsWith(".m4a")) return "audio/mp4";
        if (lower.endsWith(".ogg")) return "audio/ogg";
        if (lower.endsWith(".aac")) return "audio/aac";
        if (lower.endsWith(".wma")) return "audio/x-ms-wma";
        // 视频
        if (lower.endsWith(".mp4")) return "video/mp4";
        if (lower.endsWith(".mkv")) return "video/x-matroska";
        if (lower.endsWith(".avi")) return "video/x-msvideo";
        if (lower.endsWith(".mov")) return "video/quicktime";
        if (lower.endsWith(".webm")) return "video/webm";
        // 文档
        if (lower.endsWith(".pdf")) return "application/pdf";
        if (lower.endsWith(".txt")) return "text/plain";
        if (lower.endsWith(".json")) return "application/json";
        if (lower.endsWith(".xml")) return "application/xml";
        if (lower.endsWith(".zip")) return "application/zip";
        return "application/octet-stream";
    }
}
