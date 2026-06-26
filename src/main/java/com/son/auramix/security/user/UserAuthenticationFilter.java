package com.son.auramix.security.user;

import com.son.auramix.config.AuramixProperties;
import com.son.auramix.service.user.UserSessionInfo;
import com.son.auramix.service.user.UserTokenStore;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

/**
 * 用户 Token 认证过滤器，仅处理 /api/user/ 下的请求。
 * <p>
 * 支持两种认证方式：
 * <ol>
 *   <li><b>JWT Token</b> — {@code Authorization: Bearer <token>}（常规用户登录）</li>
 *   <li><b>内部 API Key</b> — {@code X-Internal-Api-Key: <key>}（桌面端 Express 服务间调用）
 *       此时使用配置的默认用户 ID 作为认证主体</li>
 * </ol>
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class UserAuthenticationFilter extends OncePerRequestFilter {

    private static final String HEADER = "Authorization";
    private static final String PREFIX = "Bearer ";
    private static final String PATH_PREFIX = "/api/user/";
    private static final String INTERNAL_KEY_HEADER = "X-Internal-Api-Key";

    /** 普通用户权限 */
    public static final String AUTH_USER = "USER";

    /** 内部 API Key 认证时使用的默认用户 ID（seeded 用户） */
    private static final Long INTERNAL_DEFAULT_USER_ID = 1L;
    /** 内部 API Key 认证时使用的默认邮箱 */
    private static final String INTERNAL_DEFAULT_EMAIL = "internal@auramix.local";

    private final UserTokenStore userTokenStore;
    private final AuramixProperties auramixProperties;

    @Override
    protected boolean shouldNotFilter(@NonNull HttpServletRequest request) {
        return !request.getRequestURI().startsWith(PATH_PREFIX);
    }

    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request,
                                    @NonNull HttpServletResponse response,
                                    @NonNull FilterChain chain)
            throws ServletException, IOException {
        try {
            // 1. 先尝试内部 API Key 认证
            if (tryInternalKeyAuth(request)) {
                chain.doFilter(request, response);
                return;
            }

            // 2. 再尝试 JWT Token 认证
            String token = extractToken(request);
            if (token != null) {
                UserSessionInfo info = userTokenStore.loadToken(token);
                if (info != null) {
                    List<SimpleGrantedAuthority> authorities = List.of(
                            new SimpleGrantedAuthority(AUTH_USER));
                    UserPrincipal principal = new UserPrincipal(
                            info.getId(), info.getEmail(), null, authorities);
                    UsernamePasswordAuthenticationToken auth =
                            new UsernamePasswordAuthenticationToken(principal, token, authorities);
                    SecurityContextHolder.getContext().setAuthentication(auth);
                }
            }
            chain.doFilter(request, response);
        } finally {
            SecurityContextHolder.clearContext();
        }
    }

    /**
     * 尝试通过 X-Internal-Api-Key 头部进行内部服务认证。
     * 用于桌面端 Express Server 调用 Java 后端时的免登入认证。
     *
     * @return true 表示内部 Key 匹配成功并已设置认证
     */
    private boolean tryInternalKeyAuth(HttpServletRequest request) {
        String internalKey = request.getHeader(INTERNAL_KEY_HEADER);
        if (!StringUtils.hasText(internalKey)) {
            return false;
        }

        String configuredKey = auramixProperties.getInternalApiKey();
        if (!StringUtils.hasText(configuredKey) || !configuredKey.equals(internalKey)) {
            log.warn("[UserAuth] X-Internal-Api-Key 不匹配, requestUri={}", request.getRequestURI());
            return false;
        }

        // 内部 API Key 认证成功 → 以默认用户身份设置安全上下文
        List<SimpleGrantedAuthority> authorities = List.of(
                new SimpleGrantedAuthority(AUTH_USER));
        UserPrincipal principal = new UserPrincipal(
                INTERNAL_DEFAULT_USER_ID, INTERNAL_DEFAULT_EMAIL, null, authorities);
        UsernamePasswordAuthenticationToken auth =
                new UsernamePasswordAuthenticationToken(principal, internalKey, authorities);
        SecurityContextHolder.getContext().setAuthentication(auth);
        return true;
    }

    private String extractToken(HttpServletRequest request) {
        String header = request.getHeader(HEADER);
        if (header == null || !header.startsWith(PREFIX)) {
            return null;
        }
        String token = header.substring(PREFIX.length()).trim();
        return token.isEmpty() ? null : token;
    }
}
