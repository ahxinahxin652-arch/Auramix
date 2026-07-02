package com.son.auramix.ai.statemachine;

import lombok.Getter;
import lombok.extern.slf4j.Slf4j;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Set;

/**
 * 自研轻量状态机核心。
 * <p>
 * 职责：
 * <ul>
 *   <li>维护当前状态</li>
 *   <li>校验转换合法性（基于 {@link ReviewTransition} 的 source→target 映射）</li>
 *   <li>通配转换({@code source=null})的特殊判定：ADMIN_CONFIRM 可从任何非终态转入，FAIL 可从任何活跃流水线状态转入</li>
 *   <li>转换成功后通知 {@link ReviewStateMachineListener}</li>
 * </ul>
 * <p>
 * 不持有任何持久化逻辑 — 状态持久化由调用方负责（Phase 2 的 ReviewFlowEngine 会写 DB）。
 * 线程不安全，每次审核流程应使用独立实例（通过 {@link #create(ReviewStatus)} 工厂方法创建）。
 */
@Slf4j
public class ReviewStateMachine {

    @Getter
    private ReviewStatus currentStatus;

    private final List<ReviewStateMachineListener> listeners = new ArrayList<>();

    /** 通配转换的合法 source 集合 */
    private static final Map<ReviewTransition, Set<ReviewStatus>> WILDCARD_SOURCES = Map.of(
            ReviewTransition.ADMIN_CONFIRM, Set.of(
                    ReviewStatus.PENDING, ReviewStatus.FETCH_LYRICS, ReviewStatus.DIMENSION_REVIEW,
                    ReviewStatus.JUDGE, ReviewStatus.AUTO_RESULT, ReviewStatus.AUTO_DONE,
                    ReviewStatus.MANUAL_REVIEW, ReviewStatus.FAILED
            ),
            ReviewTransition.FAIL, Set.of(
                    ReviewStatus.PENDING, ReviewStatus.FETCH_LYRICS, ReviewStatus.DIMENSION_REVIEW,
                    ReviewStatus.JUDGE
            )
    );

    private ReviewStateMachine(ReviewStatus initial) {
        this.currentStatus = initial;
    }

    /** 创建以指定初始状态启动的状态机实例 */
    public static ReviewStateMachine create(ReviewStatus initial) {
        return new ReviewStateMachine(initial);
    }

    /**
     * 触发状态转换。
     *
     * @param transition 转换事件
     * @return true=转换成功，false=转换非法（当前状态不匹配）
     */
    public boolean fire(ReviewTransition transition) {
        if (!canFire(transition)) {
            log.warn("[状态机] 非法转换: current={}, transition={}", currentStatus, transition);
            return false;
        }
        ReviewStatus from = currentStatus;
        currentStatus = transition.getTarget();
        log.debug("[状态机] 转换: {} → {} ({} )", from, currentStatus, transition.getDescription());
        notifyListeners(from, currentStatus, transition);
        return true;
    }

    /**
     * 强制触发转换（跳过合法性校验）。
     * <p>
     * 仅用于异常恢复 / 数据修复场景，正常流程不应调用。
     */
    public void forceTransition(ReviewTransition transition) {
        ReviewStatus from = currentStatus;
        currentStatus = transition.getTarget();
        log.warn("[状态机] 强制转换: {} → {} ({})", from, currentStatus, transition.getDescription());
        notifyListeners(from, currentStatus, transition);
    }

    /** 检查指定转换是否可在当前状态下触发 */
    public boolean canFire(ReviewTransition transition) {
        if (transition.isWildcard()) {
            Set<ReviewStatus> allowed = WILDCARD_SOURCES.get(transition);
            return allowed != null && allowed.contains(currentStatus);
        }
        return transition.getSource() == currentStatus;
    }

    /** 注册转换监听器 */
    public void addListener(ReviewStateMachineListener listener) {
        listeners.add(listener);
    }

    private void notifyListeners(ReviewStatus from, ReviewStatus to, ReviewTransition transition) {
        TransitionEvent event = new TransitionEvent(from, to, transition);
        for (ReviewStateMachineListener l : listeners) {
            try {
                l.onTransition(event);
            } catch (Exception e) {
                log.warn("[状态机] 监听器异常, transition={}", transition, e);
            }
        }
    }

    /** 转换事件载体 */
    @Getter
    public static class TransitionEvent {
        private final ReviewStatus from;
        private final ReviewStatus to;
        private final ReviewTransition transition;

        public TransitionEvent(ReviewStatus from, ReviewStatus to, ReviewTransition transition) {
            this.from = from;
            this.to = to;
            this.transition = transition;
        }
    }
}
