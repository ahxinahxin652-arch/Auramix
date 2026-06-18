package com.son.auramix.service.admin;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serial;
import java.io.Serializable;
import java.time.LocalDateTime;

/**
 * 写入 Redis 的管理员会话信息（JSON）。
 * <p>
 * 字段命名与 Java 端驼峰一致；RedisConfig 使用 Generic Jackson 序列化，
 * 字段名会按原样出现在 Redis 中。
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminSessionInfo implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    /** 管理员 ID */
    private Integer id;

    /** 登录用户名 */
    private String username;

    /** 是否初始管理员 */
    private Integer isRoot;

    /** 登录 IP */
    private String loginIp;

    /** 登录时间 */
    private LocalDateTime loginTime;
}
