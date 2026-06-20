package com.son.auramix.service.oss;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serial;
import java.io.Serializable;

/**
 * OSS 上传结果
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class OssUploadResult implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    /** OSS 对象 Key，用于后续删除/下载等操作 */
    private String objectKey;

    /** 文件访问URL(签名URL) */
    private String url;

    /** 文件大小(字节) */
    private long size;

    /** OSS 返回的 ETag */
    private String eTag;
}
