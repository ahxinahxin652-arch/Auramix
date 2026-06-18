package com.son.auramix.bootstrap;

import com.son.auramix.domain.entity.Admin;
import com.son.auramix.mapper.AdminMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.security.SecureRandom;

/**
 * 启动时种子初始管理员。
 * <p>
 * - 若 admin 表为空 -> 读取 {@code auramix.admin.bootstrap.{username,password}}，插入 is_root=1
 * - password 缺省时随机生成 12 位（含大小写字母+数字），并通过 log.warn 打印一次
 */
@Slf4j
@Component
@Order(0)
@RequiredArgsConstructor
public class AdminBootstrapRunner implements CommandLineRunner {

    private static final String RANDOM_CHARS =
            "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    private static final SecureRandom RANDOM = new SecureRandom();
    private static final int RANDOM_PASSWORD_LENGTH = 12;

    private final AdminMapper adminMapper;
    private final PasswordEncoder passwordEncoder;

    @Value("${auramix.admin.bootstrap.username:admin}")
    private String username;

    @Value("${auramix.admin.bootstrap.password:}")
    private String password;

    @Override
    public void run(String... args) {
        Long count = adminMapper.selectCount();
        if (count != null && count > 0) {
            log.info("[AdminBootstrapRunner] admin table not empty (count={}), skip seeding", count);
            return;
        }
        String rawPassword = (password == null || password.isBlank())
                ? generateRandomPassword()
                : password;
        if (password == null || password.isBlank()) {
            log.warn("[AdminBootstrapRunner] ====== Initial root admin password: {} ======", rawPassword);
        }
        Admin admin = new Admin();
        admin.setUsername(username);
        admin.setPassword(passwordEncoder.encode(rawPassword));
        admin.setIsRoot(1);
        admin.setStatus(1);
        adminMapper.insert(admin);
        log.info("[AdminBootstrapRunner] seeded root admin: id={} username={}", admin.getId(), admin.getUsername());
    }

    private String generateRandomPassword() {
        StringBuilder sb = new StringBuilder(RANDOM_PASSWORD_LENGTH);
        for (int i = 0; i < RANDOM_PASSWORD_LENGTH; i++) {
            sb.append(RANDOM_CHARS.charAt(RANDOM.nextInt(RANDOM_CHARS.length())));
        }
        return sb.toString();
    }
}
