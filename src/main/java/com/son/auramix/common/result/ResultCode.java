package com.son.auramix.common.result;

import lombok.Getter;

/**
 * 业务 / 系统状态码枚举
 * <p>
 * 约定：
 * 1. 成功码固定为 200。
 * 2. 4xxxx 表示业务异常（客户端语义正确但业务规则不通过）。
 * 3. 5xxxx 表示系统异常（服务端错误）。
 */
@Getter
public enum ResultCode {

    SUCCESS(200, "操作成功"),

    BAD_REQUEST(400, "请求参数不合法"),
    VALIDATION_ERROR(400, "参数校验失败"),
    UNAUTHORIZED(401, "未登录或登录已过期"),
    FORBIDDEN(403, "无访问权限"),
    NOT_FOUND(404, "资源不存在"),
    METHOD_NOT_ALLOWED(405, "请求方法不被允许"),

    BUSINESS_ERROR(4000, "业务异常"),

    INTERNAL_ERROR(5000, "系统内部错误"),
    SERVICE_UNAVAILABLE(5001, "服务暂不可用");

    private final int code;
    private final String message;

    ResultCode(int code, String message) {
        this.code = code;
        this.message = message;
    }
}
