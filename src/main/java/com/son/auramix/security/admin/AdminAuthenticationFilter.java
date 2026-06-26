package com.son.auramix.security.admin;

import com.son.auramix.config.AuramixProperties;
import com.son.auramix.service.admin.AdminSessionInfo;
import com.son.auramix.service.admin.AdminTokenStore;
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
 * 管理员 Token 认证过滤器，仅处理 /api/admin/ 下的请求。
 * <p>
 * 支持两种认证方式：
 * <ol>
 *   <li><b>JWT Token</b> — {@code Authorization: Bearer <token>}（管理员登录）</li>
 *   <li><b>内部 API Key</b> — {@code X-Internal-Api-Key: <key>}（桌面端 Express 服务间调用）
 *       此时以 ROOT_ADMIN 权限认证</li>
 * </ol>
 * <p>
 * 响应处理结束后清空 SecurityContextHolder，避免线程复用造成串号。
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class AdminAuthenticationFilter extends OncePerRequestFilter {

    private static final String HEADER = "Authorization";
    private static final String PREFIX = "Bearer ";
    private static final String PATH_PREFIX = "/api/admin/";
    private static final String INTERNAL_KEY_HEADER = "X-Internal-Api-Key";

    /** 内部 API Key 认证时使用的虚拟管理员 ID */
    private static final Integer INTERNAL_ADMIN_ID = -1;
    private static final String INTERNAL_ADMIN_USERNAME = "internal-api";

    private final AdminTokenStore tokenStore;
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
                AdminSessionInfo info = tokenStore.loadToken(token);
                if (info != null) {
                    List<SimpleGrantedAuthority> authorities = info.getIsRoot() != null
                            && info.getIsRoot() == 1
                            ? List.of(new SimpleGrantedAuthority(AdminUserDetailsService.AUTH_ROOT_ADMIN))
                            : List.of(new SimpleGrantedAuthority(AdminUserDetailsService.AUTH_ADMIN));
                    AdminUserDetails principal = new AdminUserDetails(
                            info.getId(), info.getUsername(), null, info.getIsRoot(), authorities);
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
     *
     * @return true 表示内部 Key 匹配成功并已设置 ROOT_ADMIN 认证
     */
    private boolean tryInternalKeyAuth(HttpServletRequest request) {
        String internalKey = request.getHeader(INTERNAL_KEY_HEADER);
        if (!StringUtils.hasText(internalKey)) {
            return false;
        }

        String configuredKey = auramixProperties.getInternalApiKey();
        if (!StringUtils.hasText(configuredKey) || !configuredKey.equals(internalKey)) {
            log.warn("[AdminAuth] X-Internal-Api-Key 不匹配, requestUri={}", request.getRequestURI());
            return false;
        }

        // 内部 API Key 认证成功 → 以 ROOT_ADMIN 身份设置安全上下文
        List<SimpleGrantedAuthority> authorities = List.of(
                new SimpleGrantedAuthority(AdminUserDetailsService.AUTH_ROOT_ADMIN));
        AdminUserDetails principal = new AdminUserDetails(
                INTERNAL_ADMIN_ID, INTERNAL_ADMIN_USERNAME, null, 1, authorities);
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
