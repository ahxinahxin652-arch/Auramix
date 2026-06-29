package com.son.auramix.controller.admin;

import com.son.auramix.ai.progress.ReviewProgressSseRegistry;
import com.son.auramix.ai.progress.ReviewProgressStore;
import com.son.auramix.ai.progress.ReviewProgressVO;
import com.son.auramix.common.exception.BusinessException;
import com.son.auramix.common.result.ResultCode;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AdminReviewProgressControllerTest {

    @Mock private ReviewProgressSseRegistry sseRegistry;
    @Mock private ReviewProgressStore store;

    private AdminReviewProgressController controller;

    @BeforeEach
    void setUp() {
        controller = new AdminReviewProgressController(sseRegistry, store);
    }

    @Test
    void getProgress_returnsVoWhenStoreReturnsSnapshot() {
        ReviewProgressVO vo = new ReviewProgressVO();
        vo.setRecordId(100L);
        vo.setEventType("SNAPSHOT");
        when(store.snapshot(100L)).thenReturn(vo);

        var result = controller.getProgress(100L);

        assertThat(result.getCode()).isEqualTo(ResultCode.SUCCESS.getCode());
        assertThat(result.getData()).isSameAs(vo);
    }

    @Test
    void getProgress_throwsReviewNotFoundWhenSnapshotNull() {
        when(store.snapshot(100L)).thenReturn(null);

        assertThatThrownBy(() -> controller.getProgress(100L))
            .isInstanceOf(BusinessException.class)
            .satisfies(ex -> assertThat(((BusinessException) ex).getCode())
                .isEqualTo(ResultCode.REVIEW_NOT_FOUND.getCode()));
    }

    @Test
    void streamProgress_subscribesAndPushesSnapshotWhenAvailable() {
        // given
        ReviewProgressVO snapshotVo = new ReviewProgressVO();
        snapshotVo.setRecordId(100L);
        snapshotVo.setEventType("STARTED");
        when(store.snapshot(100L)).thenReturn(snapshotVo);
        org.springframework.web.servlet.mvc.method.annotation.SseEmitter mockEmitter =
            new org.springframework.web.servlet.mvc.method.annotation.SseEmitter(0L);
        when(sseRegistry.subscribe(100L)).thenReturn(mockEmitter);

        // when
        org.springframework.web.servlet.mvc.method.annotation.SseEmitter result =
            controller.streamProgress(100L, "test-token");

        // then：返回的 emitter 与 registry 注册的一致
        assertThat(result).isSameAs(mockEmitter);
        verify(sseRegistry).subscribe(100L);
        verify(store).snapshot(100L);
    }

    @Test
    void streamProgress_subscribesEvenWhenSnapshotNull() {
        when(store.snapshot(100L)).thenReturn(null);
        org.springframework.web.servlet.mvc.method.annotation.SseEmitter mockEmitter =
            new org.springframework.web.servlet.mvc.method.annotation.SseEmitter(0L);
        when(sseRegistry.subscribe(100L)).thenReturn(mockEmitter);

        // snapshot 为 null 不应抛
        org.springframework.web.servlet.mvc.method.annotation.SseEmitter result =
            controller.streamProgress(100L, null);
        assertThat(result).isSameAs(mockEmitter);
    }
}
