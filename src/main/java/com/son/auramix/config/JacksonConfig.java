package com.son.auramix.config;

import com.fasterxml.jackson.databind.ser.std.ToStringSerializer;
import org.springframework.boot.autoconfigure.jackson.Jackson2ObjectMapperBuilderCustomizer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Jackson 全局配置
 * <p>
 * 将后端 Long / long 类型字段在序列化为 JSON 输出给前端时，自动转换为 String（字符串）格式。
 * 防止雪花 ID 等 64 位大整数在 JavaScript (最高仅能安全表示 53 位整数) 反序列化时产生精度丢失。
 */
@Configuration
public class JacksonConfig {

    @Bean
    public Jackson2ObjectMapperBuilderCustomizer jackson2ObjectMapperBuilderCustomizer() {
        return builder -> {
            // 包装类 Long 序列化为 String
            builder.serializerByType(Long.class, ToStringSerializer.instance);
            // 基本类型 long 序列化为 String
            builder.serializerByType(Long.TYPE, ToStringSerializer.instance);
        };
    }
}
