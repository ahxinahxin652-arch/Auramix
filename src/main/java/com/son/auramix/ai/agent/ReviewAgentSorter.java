package com.son.auramix.ai.agent;

import org.springframework.core.annotation.AnnotationAwareOrderComparator;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

/**
 * 把 List<DimensionAgent> 按 @Order 注解值升序排序的工具类（Spring 组件）。
 * 使用 Spring 的 AnnotationAwareOrderComparator，自动识别 @Order 注解和 Ordered 接口。
 */
@Component
public class ReviewAgentSorter {

    /**
     * 返回按 @Order 升序排列的新 List（不修改入参）。
     */
    public List<DimensionAgent> sort(List<DimensionAgent> agents) {
        List<DimensionAgent> copy = new ArrayList<>(agents);
        AnnotationAwareOrderComparator.sort(copy);
        return copy;
    }
}
