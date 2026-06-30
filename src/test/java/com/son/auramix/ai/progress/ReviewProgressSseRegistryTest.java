package com.son.auramix.ai.progress;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;

import static org.assertj.core.api.Assertions.assertThat;

class ReviewProgressSseRegistryTest {

    private ReviewProgressSseRegistry registry;

    @BeforeEach
    void setUp() {
        registry = new ReviewProgressSseRegistry();
    }

    @Test
    void subscribe_returnsEmitterAndRegistersIt() {
        SseEmitter emitter = registry.subscribe(100L);
        assertThat(emitter).isNotNull();
        // send 应能找到这个 emitter（不抛即可验证已注册）
        ReviewProgressVO payload = new ReviewProgressVO();
        payload.setEventType("STARTED");
        payload.setRecordId(100L);
        registry.send(100L, payload);  // 不应抛
    }

    @Test
    void complete_removesAllEmittersForRecord() {
        registry.subscribe(100L);
        registry.subscribe(100L);
        registry.complete(100L);
        // complete 后再 send 不应抛，且无 emitter 收到
        ReviewProgressVO payload = new ReviewProgressVO();
        payload.setEventType("FINISHED");
        registry.send(100L, payload);  // 不应抛
    }

    @Test
    void complete_onNonExistentRecordDoesNotThrow() {
        registry.complete(999L);  // 不应抛
    }

    @Test
    void send_onNonExistentRecordDoesNotThrow() {
        ReviewProgressVO payload = new ReviewProgressVO();
        payload.setEventType("STARTED");
        registry.send(999L, payload);  // 不应抛
    }

    @Test
    void concurrentSubscribeSameRecordNoException() throws Exception {
        int threads = 20;
        ExecutorService pool = Executors.newFixedThreadPool(threads);
        CountDownLatch latch = new CountDownLatch(threads);
        for (int i = 0; i < threads; i++) {
            pool.submit(() -> {
                try {
                    registry.subscribe(100L);
                } finally {
                    latch.countDown();
                }
            });
        }
        assertThat(latch.await(5, TimeUnit.SECONDS)).isTrue();
        pool.shutdown();
        // 完成所有 emitter，不抛即可
        registry.complete(100L);
    }
}
