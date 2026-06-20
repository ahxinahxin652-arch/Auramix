package com.son.auramix.service.user;

import cn.hutool.core.util.RandomUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

/**
 * 邮件发送服务
 * <p>
 * 仅在配置了 spring.mail.username 时才生效。
 */
@Slf4j
@Service
@RequiredArgsConstructor
@ConditionalOnProperty(prefix = "spring.mail", name = "username")
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String from;

    /**
     * 发送验证码邮件
     *
     * @param to   收件人邮箱
     * @param code 6位验证码
     */
    public void sendVerificationCode(String to, String code) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(from);
        message.setTo(to);
        message.setSubject("Auramix - 邮箱验证码");
        message.setText(String.format("""
                您的验证码是：%s
                
                验证码 5 分钟内有效，请勿泄露给他人。
                
                如非本人操作，请忽略此邮件。
                """, code));
        mailSender.send(message);
        log.info("[EmailService] 验证码已发送, to={}", to);
    }
}
