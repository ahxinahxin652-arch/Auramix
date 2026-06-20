package com.son.auramix.security.user;

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
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

/**
 * 用户 Token 认证过滤器，仅处理 /api/user/ 下的请求。
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class UserAuthenticationFilter extends OncePerRequestFilter {

    private static final String HEADER = "Authorization";
    private static final String PREFIX = "Bearer ";
    private static final String PATH_PREFIX = "/api/user/";

    /** 普通用户权限 */
    public static final String AUTH_USER = "USER";

    private final UserTokenStore userTokenStore;

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

    private String extractToken(HttpServletRequest request) {
        String header = request.getHeader(HEADER);
        if (header == null || !header.startsWith(PREFIX)) {
            return null;
        }
        String token = header.substring(PREFIX.length()).trim();
        return token.isEmpty() ? null : token;
    }
}
