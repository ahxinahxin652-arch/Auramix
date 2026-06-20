package com.son.auramix.service.user;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serial;
import java.io.Serializable;
import java.time.LocalDateTime;

/**
 * 用户会话信息，存入 Redis
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserSessionInfo implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    /** 用户 ID */
    private Long id;

    /** 邮箱 */
    private String email;

    /** 登录 IP */
    private String loginIp;

    /** 登录时间 */
    private LocalDateTime loginTime;
}
