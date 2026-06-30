package com.son.auramix.annotation;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * 切面标记注解：标注在方法上，方法返回成功后自动触发音频特征分析。
 * <p>
 * 切面会从方法返回值中提取 trackId，从请求参数中提取 audioFilePath，
 * 异步调用 AudioFeatureService.analyzeAndSave() 执行分析并写入数据库。
 */
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
public @interface AnalyzeAudio {
}
