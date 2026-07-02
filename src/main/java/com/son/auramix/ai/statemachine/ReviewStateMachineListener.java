package com.son.auramix.ai.statemachine;

/**
 * 状态机转换监听器（函数式接口）。
 * <p>
 * 注册到 {@link ReviewStateMachine#addListener(ReviewStateMachineListener)} 后，
 * 每次成功转换都会回调，可用于日志、SSE 推送、进度持久化等副作用。
 */
@FunctionalInterface
public interface ReviewStateMachineListener {

    /**
     * @param event 包含 from（转换前状态）、to（转换后状态）、transition（触发事件）
     */
    void onTransition(ReviewStateMachine.TransitionEvent event);
}
