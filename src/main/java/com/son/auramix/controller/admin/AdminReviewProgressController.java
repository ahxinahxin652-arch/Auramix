package com.son.auramix.controller.admin;

import com.son.auramix.ai.progress.ProgressEvent;
import com.son.auramix.ai.progress.ReviewProgressSseRegistry;
import com.son.auramix.ai.progress.ReviewProgressStore;
import com.son.auramix.ai.progress.ReviewProgressVO;
import com.son.auramix.common.exception.BusinessException;
import com.son.auramix.common.result.Result;
import com.son.auramix.common.result.ResultCode;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

/**
 * 管理员审核进度可视化端点：
 * <ul>
 *   <li>GET /{id}/progress — 同步快照（详情页/列表页首次加载用）</li>
 *   <li>GET /{id}/progress/stream — SSE 实时流（Task 9 实现）</li>
 * </ul>
 * 与 AdminReviewController 共用 @RequestMapping 前缀和 @PreAuthorize 权限。
 */
@RestController
@RequestMapping("/api/admin/manage/reviews")
@RequiredArgsConstructor
@PreAuthorize("hasAuthority('ROOT_ADMIN') or hasAuthority('ADMIN')")
public class AdminReviewProgressController {

    private final ReviewProgressSseRegistry sseRegistry;
    private final ReviewProgressStore store;

    /** 同步快照：返回当前 progress_json 反序列化的 VO */
    @GetMapping("/{id}/progress")
    public Result<ReviewProgressVO> getProgress(@PathVariable Long id) {
        ReviewProgressVO vo = store.snapshot(id);
        if (vo == null) {
            throw new BusinessException(ResultCode.REVIEW_NOT_FOUND);
        }
        return Result.success(vo);
    }

    /**
     * SSE 流：实时推送该 record 的进度事件。
     * <p>
     * 订阅后立即推一次 SNAPSHOT 事件（含当前 progress_json 全量状态），让前端重连时立即看到已发生的进度；
     * 之后转发 STARTED / DIMENSION_DONE / JUDGE_DONE / FINISHED 增量事件。
     * <p>
     * token 通过 query 传入（浏览器 EventSource 不支持自定义 Header），由 AdminAuthenticationFilter 回退鉴权。
     */
    @GetMapping(value = "/{id}/progress/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter streamProgress(@PathVariable Long id,
                                     @RequestParam(required = false) String token) {
        SseEmitter emitter = sseRegistry.subscribe(id);
        // 推 SNAPSHOT 事件补偿重连
        ReviewProgressVO snapshotVo = store.snapshot(id);
        if (snapshotVo != null) {
            try {
                ProgressEvent.snapshot(id, snapshotVo);
                emitter.send(SseEmitter.event()
                    .name("SNAPSHOT")
                    .data(snapshotVo, MediaType.APPLICATION_JSON));
            } catch (Exception ignored) {
                // SNAPSHOT 推送失败不阻塞订阅，后续增量事件仍会通过 registry 转发
            }
        }
        return emitter;
    }
}
