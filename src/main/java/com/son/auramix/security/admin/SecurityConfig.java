package com.son.auramix.security.admin;

import com.son.auramix.security.user.UserAuthenticationFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final AdminAuthenticationFilter adminAuthenticationFilter;
    private final UserAuthenticationFilter userAuthenticationFilter;
    private final RestAuthenticationEntryPoint authenticationEntryPoint;
    private final RestAccessDeniedHandler accessDeniedHandler;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration cfg) throws Exception {
        return cfg.getAuthenticationManager();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(AbstractHttpConfigurer::disable)
            .cors(AbstractHttpConfigurer::disable)
            .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .exceptionHandling(e -> e
                    .authenticationEntryPoint(authenticationEntryPoint)
                    .accessDeniedHandler(accessDeniedHandler))
            .authorizeHttpRequests(auth -> auth
                    // 公开接口
                    .requestMatchers("/api/health/**").permitAll()
                    // 管理员
                    .requestMatchers("/api/admin/auth/login").permitAll()
                    .requestMatchers("/api/admin/**").authenticated()
                    // 用户
                    .requestMatchers("/api/user/auth/**").permitAll()
                    .requestMatchers("/api/user/**").authenticated()
                    // 其他
                    .anyRequest().permitAll())
            .addFilterBefore(adminAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)
            .addFilterBefore(userAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }
}
