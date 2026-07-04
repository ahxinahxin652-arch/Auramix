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
     * 用户行为类型
     * 0=播放  1=收藏  2=取消收藏  3=跳过
     * 4=完整听完  5=搜索  6=分享  7=添加到歌单
     */
    int behaviorType() default -1;

    /**
     * 行为上下文（来源页面）
     * home / recommend / discover / playlist / search
     */
    String context() default "";

    /**
     * 播放来源类型
     * -1=未指定  0=歌单  1=专辑  2=歌手页
     *  3=今日推荐  4=AI生成歌单  5=场景化推荐
     *  6=发现模块  7=相似推荐
     */
    int contextType() default -1;

    /**
     * 播放来源对应的 ID：
     * - contextType 0-2: 歌单ID / 专辑ID / 歌手ID（必有值）
     * - contextType 3-4: 推荐记录ID / AI歌单ID（可能有值）
     * - contextType 5-7: 通常无 ID（前端传 NaN）
     * 仅当 contextType >= 0 时有效
     */
    long contextId() default 0;
}
