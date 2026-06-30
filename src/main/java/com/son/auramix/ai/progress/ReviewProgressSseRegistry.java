package com.son.auramix.ai.progress;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;

/**
 * SSE Emitter 集中管理：维护 recordId → List&lt;SseEmitter&gt; 映射。
 * <ul>
 *   <li>{@link #subscribe} 注册新 emitter，附带 onCompletion/onTimeout/onError 自动移除</li>
 *   <li>{@link #send} 广播到该 record 的所有订阅者，单个发送失败立即移除</li>
 *   <li>{@link #complete} 流水线完结时主动关闭所有连接</li>
 * </ul>
 * <p>
 * 使用 ConcurrentHashMap + CopyOnWriteArrayList 保证多管理员并发订阅/广播线程安全。
 */
@Slf4j
@Component
public class ReviewProgressSseRegistry {

    private final Map<Long, List<SseEmitter>> emitters = new ConcurrentHashMap<>();

    /**
     * 订阅指定 record 的进度事件。
     * @return 永不超时的 SseEmitter（由 FINISHED 事件主动 complete）
     */
    public SseEmitter subscribe(Long recordId) {
        SseEmitter emitter = new SseEmitter(0L);
        emitters.computeIfAbsent(recordId, k -> new CopyOnWriteArrayList<>()).add(emitter);
        emitter.onCompletion(() -> remove(recordId, emitter));
        emitter.onTimeout(() -> remove(recordId, emitter));
        emitter.onError(ex -> remove(recordId, emitter));
        return emitter;
    }

    /**
     * 广播事件到该 record 的所有订阅者。
     * 单个 emitter 发送失败立即移除，不影响其他订阅者。
     */
    public void send(Long recordId, ReviewProgressVO payload) {
        List<SseEmitter> list = emitters.get(recordId);
        if (list == null || list.isEmpty()) return;
        for (SseEmitter e : list) {
            try {
                e.send(SseEmitter.event()
                    .name(payload.getEventType())
                    .data(payload, MediaType.APPLICATION_JSON));
            } catch (Exception ex) {
                log.warn("[SSE] 发送失败，移除 emitter recordId={}", recordId, ex);
                remove(recordId, e);
            }
        }
    }

    /**
     * 主动关闭该 record 的所有 SSE 连接（FINISHED 时调用）。
     */
    public void complete(Long recordId) {
        List<SseEmitter> list = emitters.remove(recordId);
        if (list == null) return;
        for (SseEmitter e : list) {
            try {
                e.complete();
            } catch (Exception ignored) {
                // emitter 可能已关闭，忽略
            }
        }
    }

    private void remove(Long recordId, SseEmitter emitter) {
        List<SseEmitter> list = emitters.get(recordId);
        if (list == null) return;
        list.remove(emitter);
        // 如果 list 空了，尝试从 map 移除空 list（避免内存泄漏）
        if (list.isEmpty()) {
            emitters.remove(recordId, list);
        }
    }
}
