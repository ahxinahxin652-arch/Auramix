package com.son.auramix.ai.statemachine;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * 状态机核心单元测试：验证转换合法性、通配规则、监听器通知。
 * 不依赖 Spring，纯 POJO 测试。
 */
class ReviewStateMachineTest {

    // ---------- 正向转换链 ----------

    @Test
    void fullPipelineHappyPath() {
        ReviewStateMachine sm = ReviewStateMachine.create(ReviewStatus.PENDING);

        assertThat(sm.fire(ReviewTransition.START_FETCH_LYRICS)).isTrue();
        assertThat(sm.getCurrentStatus()).isEqualTo(ReviewStatus.FETCH_LYRICS);

        assertThat(sm.fire(ReviewTransition.LYRICS_FETCHED)).isTrue();
        assertThat(sm.getCurrentStatus()).isEqualTo(ReviewStatus.DIMENSION_REVIEW);

        assertThat(sm.fire(ReviewTransition.START_JUDGE)).isTrue();
        assertThat(sm.getCurrentStatus()).isEqualTo(ReviewStatus.JUDGE);

        assertThat(sm.fire(ReviewTransition.JUDGE_COMPLETED_HIGH_CONF)).isTrue();
        assertThat(sm.getCurrentStatus()).isEqualTo(ReviewStatus.AUTO_RESULT);

        assertThat(sm.fire(ReviewTransition.AUTO_PROCESS)).isTrue();
        assertThat(sm.getCurrentStatus()).isEqualTo(ReviewStatus.AUTO_DONE);
        assertThat(sm.getCurrentStatus().isTerminal()).isTrue();
    }

    @Test
    void lowConfidencePath() {
        ReviewStateMachine sm = ReviewStateMachine.create(ReviewStatus.PENDING);
        sm.fire(ReviewTransition.START_FETCH_LYRICS);
        sm.fire(ReviewTransition.LYRICS_FETCHED);
        sm.fire(ReviewTransition.START_JUDGE);

        assertThat(sm.fire(ReviewTransition.JUDGE_COMPLETED_LOW_CONF)).isTrue();
        assertThat(sm.getCurrentStatus()).isEqualTo(ReviewStatus.MANUAL_REVIEW);
    }

    @Test
    void dimensionPendingShortCircuit() {
        ReviewStateMachine sm = ReviewStateMachine.create(ReviewStatus.PENDING);
        sm.fire(ReviewTransition.START_FETCH_LYRICS);
        sm.fire(ReviewTransition.LYRICS_FETCHED);
        // 维度审核阶段直接短路
        assertThat(sm.fire(ReviewTransition.DIMENSION_PENDING_SHORT_CIRCUIT)).isTrue();
        assertThat(sm.getCurrentStatus()).isEqualTo(ReviewStatus.MANUAL_REVIEW);
    }

    @Test
    void dimensionHighConfFailShortCircuit() {
        ReviewStateMachine sm = ReviewStateMachine.create(ReviewStatus.PENDING);
        sm.fire(ReviewTransition.START_FETCH_LYRICS);
        sm.fire(ReviewTransition.LYRICS_FETCHED);
        // 维度高置信度 FAIL → 短路自动处理
        assertThat(sm.fire(ReviewTransition.DIMENSION_HIGH_CONF_FAIL)).isTrue();
        assertThat(sm.getCurrentStatus()).isEqualTo(ReviewStatus.AUTO_RESULT);
    }

    @Test
    void dimensionHighConfFailOnlyFromDimensionReview() {
        // JUDGE 状态不能触发 DIMENSION_HIGH_CONF_FAIL
        ReviewStateMachine sm = ReviewStateMachine.create(ReviewStatus.JUDGE);
        assertThat(sm.fire(ReviewTransition.DIMENSION_HIGH_CONF_FAIL)).isFalse();
        assertThat(sm.getCurrentStatus()).isEqualTo(ReviewStatus.JUDGE);
    }

    // ---------- 非法转换 ----------

    @Test
    void illegalTransitionReturnsFalse() {
        ReviewStateMachine sm = ReviewStateMachine.create(ReviewStatus.PENDING);
        // PENDING 不能直接跳到 JUDGE
        assertThat(sm.fire(ReviewTransition.START_JUDGE)).isFalse();
        assertThat(sm.getCurrentStatus()).isEqualTo(ReviewStatus.PENDING);
    }

    @Test
    void illegalTransitionFromTerminalState() {
        ReviewStateMachine sm = ReviewStateMachine.create(ReviewStatus.AUTO_DONE);
        // 终态不能再推进
        assertThat(sm.fire(ReviewTransition.AUTO_PROCESS)).isFalse();
        assertThat(sm.getCurrentStatus()).isEqualTo(ReviewStatus.AUTO_DONE);
    }

    @Test
    void illegalRetryFromNonFailed() {
        ReviewStateMachine sm = ReviewStateMachine.create(ReviewStatus.PENDING);
        assertThat(sm.fire(ReviewTransition.RETRY)).isFalse();
    }

    @Test
    void legalRetryFromFailed() {
        ReviewStateMachine sm = ReviewStateMachine.create(ReviewStatus.FAILED);
        assertThat(sm.fire(ReviewTransition.RETRY)).isTrue();
        assertThat(sm.getCurrentStatus()).isEqualTo(ReviewStatus.PENDING);
    }

    // ---------- 通配转换 ----------

    @Test
    void adminConfirmFromAnyNonTerminalStatus() {
        // 从各种状态都能 ADMIN_CONFIRM
        ReviewStatus[] testable = {
                ReviewStatus.PENDING, ReviewStatus.FETCH_LYRICS, ReviewStatus.DIMENSION_REVIEW,
                ReviewStatus.JUDGE, ReviewStatus.AUTO_RESULT, ReviewStatus.AUTO_DONE,
                ReviewStatus.MANUAL_REVIEW, ReviewStatus.FAILED
        };
        for (ReviewStatus from : testable) {
            ReviewStateMachine sm = ReviewStateMachine.create(from);
            assertThat(sm.fire(ReviewTransition.ADMIN_CONFIRM))
                    .as("ADMIN_CONFIRM from %s should succeed", from)
                    .isTrue();
            assertThat(sm.getCurrentStatus()).isEqualTo(ReviewStatus.ADMIN_DONE);
        }
    }

    @Test
    void adminConfirmFromAdminDoneFails() {
        // ADMIN_DONE 不能再 ADMIN_CONFIRM（已是终态）
        ReviewStateMachine sm = ReviewStateMachine.create(ReviewStatus.ADMIN_DONE);
        assertThat(sm.fire(ReviewTransition.ADMIN_CONFIRM)).isFalse();
    }

    @Test
    void failFromAnyPipelineActiveStatus() {
        ReviewStatus[] pipelineStates = {
                ReviewStatus.PENDING, ReviewStatus.FETCH_LYRICS,
                ReviewStatus.DIMENSION_REVIEW, ReviewStatus.JUDGE
        };
        for (ReviewStatus from : pipelineStates) {
            ReviewStateMachine sm = ReviewStateMachine.create(from);
            assertThat(sm.fire(ReviewTransition.FAIL))
                    .as("FAIL from %s should succeed", from)
                    .isTrue();
            assertThat(sm.getCurrentStatus()).isEqualTo(ReviewStatus.FAILED);
        }
    }

    @Test
    void failFromNonPipelineStatusFails() {
        // AUTO_RESULT / MANUAL_REVIEW / AUTO_DONE / ADMIN_DONE 不能 FAIL
        ReviewStatus[] nonPipeline = {
                ReviewStatus.AUTO_RESULT, ReviewStatus.MANUAL_REVIEW,
                ReviewStatus.AUTO_DONE, ReviewStatus.ADMIN_DONE
        };
        for (ReviewStatus from : nonPipeline) {
            ReviewStateMachine sm = ReviewStateMachine.create(from);
            assertThat(sm.fire(ReviewTransition.FAIL))
                    .as("FAIL from %s should fail", from)
                    .isFalse();
        }
    }

    // ---------- canFire (不实际转换) ----------

    @Test
    void canFireChecksWithoutMutating() {
        ReviewStateMachine sm = ReviewStateMachine.create(ReviewStatus.PENDING);
        assertThat(sm.canFire(ReviewTransition.START_FETCH_LYRICS)).isTrue();
        assertThat(sm.canFire(ReviewTransition.START_JUDGE)).isFalse();
        // canFire 不改变状态
        assertThat(sm.getCurrentStatus()).isEqualTo(ReviewStatus.PENDING);
    }

    // ---------- 强制转换 ----------

    @Test
    void forceTransitionSkipsValidation() {
        ReviewStateMachine sm = ReviewStateMachine.create(ReviewStatus.PENDING);
        sm.forceTransition(ReviewTransition.AUTO_PROCESS);
        assertThat(sm.getCurrentStatus()).isEqualTo(ReviewStatus.AUTO_DONE);
    }

    // ---------- 监听器 ----------

    @Test
    void listenerReceivesTransitionEvents() {
        ReviewStateMachine sm = ReviewStateMachine.create(ReviewStatus.PENDING);
        java.util.List<ReviewStateMachine.TransitionEvent> events = new java.util.ArrayList<>();
        sm.addListener(events::add);

        sm.fire(ReviewTransition.START_FETCH_LYRICS);
        sm.fire(ReviewTransition.LYRICS_FETCHED);

        assertThat(events).hasSize(2);
        assertThat(events.get(0).getFrom()).isEqualTo(ReviewStatus.PENDING);
        assertThat(events.get(0).getTo()).isEqualTo(ReviewStatus.FETCH_LYRICS);
        assertThat(events.get(1).getFrom()).isEqualTo(ReviewStatus.FETCH_LYRICS);
        assertThat(events.get(1).getTo()).isEqualTo(ReviewStatus.DIMENSION_REVIEW);
    }

    @Test
    void listenerExceptionDoesNotBreakTransition() {
        ReviewStateMachine sm = ReviewStateMachine.create(ReviewStatus.PENDING);
        sm.addListener(e -> { throw new RuntimeException("listener boom"); });

        // 监听器抛异常不影响状态转换本身
        boolean result = sm.fire(ReviewTransition.START_FETCH_LYRICS);
        assertThat(result).isTrue();
        assertThat(sm.getCurrentStatus()).isEqualTo(ReviewStatus.FETCH_LYRICS);
    }

    // ---------- ReviewStatus 枚举辅助方法 ----------

    @Test
    void fromDbStatusRoundTrip() {
        // 终态/挂起态的 int 映射应可往返
        assertThat(ReviewStatus.fromDbStatus(1)).isEqualTo(ReviewStatus.AUTO_RESULT);
        assertThat(ReviewStatus.fromDbStatus(2)).isEqualTo(ReviewStatus.AUTO_DONE);
        assertThat(ReviewStatus.fromDbStatus(3)).isEqualTo(ReviewStatus.MANUAL_REVIEW);
        assertThat(ReviewStatus.fromDbStatus(4)).isEqualTo(ReviewStatus.ADMIN_DONE);
        assertThat(ReviewStatus.fromDbStatus(5)).isEqualTo(ReviewStatus.FAILED);
        // dbStatus=0 默认返回 PENDING（无法区分具体阶段）
        assertThat(ReviewStatus.fromDbStatus(0)).isEqualTo(ReviewStatus.PENDING);
    }

    @Test
    void isTerminalChecks() {
        assertThat(ReviewStatus.AUTO_DONE.isTerminal()).isTrue();
        assertThat(ReviewStatus.ADMIN_DONE.isTerminal()).isTrue();
        assertThat(ReviewStatus.PENDING.isTerminal()).isFalse();
        assertThat(ReviewStatus.AUTO_RESULT.isTerminal()).isFalse();
        assertThat(ReviewStatus.MANUAL_REVIEW.isTerminal()).isFalse();
        assertThat(ReviewStatus.FAILED.isTerminal()).isFalse();
    }

    @Test
    void isPipelineActiveChecks() {
        assertThat(ReviewStatus.PENDING.isPipelineActive()).isTrue();
        assertThat(ReviewStatus.FETCH_LYRICS.isPipelineActive()).isTrue();
        assertThat(ReviewStatus.DIMENSION_REVIEW.isPipelineActive()).isTrue();
        assertThat(ReviewStatus.JUDGE.isPipelineActive()).isTrue();
        assertThat(ReviewStatus.AUTO_RESULT.isPipelineActive()).isFalse();
        assertThat(ReviewStatus.MANUAL_REVIEW.isPipelineActive()).isFalse();
        assertThat(ReviewStatus.FAILED.isPipelineActive()).isFalse();
    }
}
