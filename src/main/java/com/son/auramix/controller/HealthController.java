package com.son.auramix.controller;

import com.son.auramix.common.exception.BusinessException;
import com.son.auramix.common.result.Result;
import com.son.auramix.common.result.ResultCode;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.Duration;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.LinkedHashMap;
import java.util.Map;

/**
 * 健康检查 / 基础架构验证 Controller
 * <p>
 * 用于人工快速验证 Result 包装、异常处理、Redis 连通。
 */
@RestController
@RequestMapping("/api/health")
@RequiredArgsConstructor
public class HealthController {

    private final RedisTemplate<String, Object> redisTemplate;

    @GetMapping
    public Result<Map<String, Object>> health() {
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("status", "UP");
        data.put("app", "Auramix");
        data.put("now", LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));
        return Result.success(data);
    }

    /**
     * 验证业务异常 -> 统一响应
     */
    @GetMapping("/biz-error")
    public Result<Void> bizError(@RequestParam(required = false) String message) {
        throw new BusinessException(
                message == null ? "这是人为抛出的业务异常" : message
        );
    }

    /**
     * 验证系统异常 -> 统一响应
     */
    @GetMapping("/sys-error")
    public Result<Void> sysError() {
        throw new IllegalStateException("这是人为抛出的系统异常");
    }

    /**
     * 验证 ResultCode 枚举 -> 统一响应
     */
    @GetMapping("/not-found")
    public Result<Void> notFound() {
        return Result.error(ResultCode.NOT_FOUND, "演示 NOT_FOUND 响应");
    }

    /**
     * 验证 Redis：写入并读取一个 key
     */
    @GetMapping("/redis")
    public Result<Map<String, Object>> redisPing() {
        String key = "auramix:health:ping";
        String value = "pong-" + System.currentTimeMillis();
        redisTemplate.opsForValue().set(key, value, Duration.ofSeconds(30));
        Object read = redisTemplate.opsForValue().get(key);
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("written", value);
        data.put("read", read);
        return Result.success(data);
    }
}
