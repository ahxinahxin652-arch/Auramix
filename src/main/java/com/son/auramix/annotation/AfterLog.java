package com.son.auramix.annotation;


import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/** 切面标记注解：标注在需要记录日志的方法上 */
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
public @interface AfterLog {

    /** 操作描述，用于日志区分 */
    String value() default "";

    /**
     * 播放来源类型
     * -1=未指定  0=歌单  1=专辑  2=歌手页
     */
    int contextType() default -1;

    /**
     * 播放来源对应的 ID（歌单ID / 专辑ID / 歌手ID）
     * 仅当 contextType >= 0 时有效
     */
    long contextId() default 0;
}
