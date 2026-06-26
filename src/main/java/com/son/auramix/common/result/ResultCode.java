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

    BUSINESS_ERROR(400, "业务异常"),

    INTERNAL_ERROR(500, "系统内部错误"),
    SERVICE_UNAVAILABLE(501, "服务暂不可用"),

    // ============================ 管理员域 ============================

    /** 用户名或密码错误（不区分用户名是否存在，避免枚举） */
    ADMIN_BAD_CREDENTIALS(411, "用户名或密码错误"),
    /** 账号已被停用 */
    ADMIN_DISABLED(431, "账号已被停用"),
    /** 管理员不存在 */
    ADMIN_NOT_FOUND(441, "管理员不存在"),
    /** 用户名已被占用 */
    ADMIN_USERNAME_TAKEN(401, "用户名已被占用"),
    /** 邮箱已被占用 */
    ADMIN_EMAIL_TAKEN(402, "邮箱已被占用"),
    /** 不能对自己进行此操作 */
    ADMIN_CANNOT_MODIFY_SELF(403, "不能对自己进行此操作"),
    /** 不能操作初始管理员 */
    ADMIN_CANNOT_MODIFY_ROOT(404, "不能操作初始管理员"),
    /** 登录凭证无效或已过期 */
    ADMIN_TOKEN_INVALID(412, "登录凭证无效或已过期"),
    /** 无管理员操作权限 */
    ADMIN_FORBIDDEN(432, "无管理员操作权限"),
    /** 当前不支持启用账号 */
    ADMIN_ENABLE_NOT_SUPPORTED(405, "当前不支持启用账号"),

    // ============================ 用户域 ============================

    /** 邮箱或密码错误 */
    USER_BAD_CREDENTIALS(4101, "邮箱或密码错误"),
    /** 邮箱已被注册 */
    USER_EMAIL_TAKEN(4102, "邮箱已被注册"),
    /** 用户不存在 */
    USER_NOT_FOUND(4103, "用户不存在"),
    /** 验证码错误或已过期 */
    USER_CODE_INVALID(4104, "验证码错误或已过期"),
    /** 验证码发送过于频繁 */
    USER_CODE_TOO_FREQUENT(4105, "验证码发送过于频繁，请稍后再试"),
    /** 登录凭证无效或已过期 */
    USER_TOKEN_INVALID(4106, "登录凭证无效或已过期"),
    /** 无用户操作权限 */
    USER_FORBIDDEN(4107, "无用户操作权限"),
    /** 该账号已被封禁 */
    USER_BANNED(4108, "该账号已被封禁，无法登录"),

    // ============================ 审核域 ============================

    /** 审核记录不存在 */
    REVIEW_NOT_FOUND(421, "审核记录不存在"),
    /** 该审核记录不在待确认状态 */
    REVIEW_NOT_PENDING(422, "该审核记录不在待确认状态"),
    /** 该审核记录已被处理 */
    REVIEW_ALREADY_PROCESSED(423, "该审核记录已被处理");

    private final int code;
    private final String message;

    ResultCode(int code, String message) {
        this.code = code;
        this.message = message;
    }
}
