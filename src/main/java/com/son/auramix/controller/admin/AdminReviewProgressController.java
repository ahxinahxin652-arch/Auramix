package com.son.auramix.controller.admin;

import com.son.auramix.ai.progress.ReviewProgressSseRegistry;
import com.son.auramix.ai.progress.ReviewProgressStore;
import com.son.auramix.ai.progress.ReviewProgressVO;
import com.son.auramix.common.exception.BusinessException;
import com.son.auramix.common.result.Result;
import com.son.auramix.common.result.ResultCode;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

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

    // SSE 流端点 streamProgress 在 Task 9 实现
}
