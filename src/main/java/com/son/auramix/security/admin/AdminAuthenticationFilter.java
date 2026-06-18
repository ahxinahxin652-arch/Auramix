package com.son.auramix.security.admin;

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
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

/**
 * 解析 {@code Authorization: Bearer <token>}：
 * <ol>
 *   <li>未带 / 格式错 -> 放行，后续由 Spring Security 决定是否要 401</li>
 *   <li>Redis 命中 -> 构造 Authentication，写入 SecurityContext；同时续期 TTL</li>
 *   <li>Redis 未命中 -> 不设 context，放行到 Spring Security</li>
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

    private final AdminTokenStore tokenStore;

    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request,
                                    @NonNull HttpServletResponse response,
                                    @NonNull FilterChain chain)
            throws ServletException, IOException {
        try {
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
                    // credentials 字段保存 token，供 /logout 读取后撤销
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

    private String extractToken(HttpServletRequest request) {
        String header = request.getHeader(HEADER);
        if (header == null || !header.startsWith(PREFIX)) {
            return null;
        }
        String token = header.substring(PREFIX.length()).trim();
        return token.isEmpty() ? null : token;
    }
}
