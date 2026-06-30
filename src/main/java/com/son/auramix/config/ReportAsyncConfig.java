package com.son.auramix.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;

import java.util.concurrent.Executor;

/**
 * 周期报告专用线程池 (report-).
 * <p>
 * 单独的线程池避免与 reviewTaskExecutor 抢资源.
 * 不复用原有 AsyncConfig, 保证原有文件零改动.
 */
@Configuration
public class ReportAsyncConfig {

    @Bean("reportTaskExecutor")
    public Executor reportTaskExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(2);
        executor.setMaxPoolSize(8);
        executor.setQueueCapacity(200);
        executor.setThreadNamePrefix("report-");
        executor.setKeepAliveSeconds(60);
        executor.initialize();
        return executor;
    }
}