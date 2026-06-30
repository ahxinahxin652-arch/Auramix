package com.son.auramix.controller.admin;

import com.son.auramix.common.result.PageResult;
import com.son.auramix.common.result.Result;
import com.son.auramix.domain.dto.admin.ReviewConfirmDTO;
import com.son.auramix.domain.vo.admin.ReviewDetailVO;
import com.son.auramix.domain.vo.admin.ReviewListItemVO;
import com.son.auramix.security.admin.AdminUserDetails;
import com.son.auramix.service.admin.ReviewService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/manage/reviews")
@RequiredArgsConstructor
@PreAuthorize("hasAuthority('ROOT_ADMIN') or hasAuthority('ADMIN')")
public class AdminReviewController {

    private final ReviewService reviewService;

    @GetMapping("/pending")
    public Result<PageResult<ReviewListItemVO>> listPending(
            @RequestParam(required = false, defaultValue = "1") Integer pageNum,
            @RequestParam(required = false, defaultValue = "10") Integer pageSize) {
        return Result.success(reviewService.listPending(pageNum, pageSize));
    }

    /**
     * 分页查询所有审核记录，可选按 status 筛选。
     * <p>
     * status 取值：0=AI审核中, 1=AI审核完成待自动处理, 2=已自动处理,
     * 3=待人工确认, 4=人工已确认, 5=失败/异常；不传则返回全部。
     */
    @GetMapping
    public Result<PageResult<ReviewListItemVO>> listAll(
            @RequestParam(required = false) Integer status,
            @RequestParam(required = false, defaultValue = "1") Integer pageNum,
            @RequestParam(required = false, defaultValue = "10") Integer pageSize) {
        return Result.success(reviewService.listAll(status, pageNum, pageSize));
    }

    /**
     * 查询单条审核记录详情：
     * <ul>
     *   <li>审核中 (status=0)：返回 {@code progress} 实时进度（各维度 PENDING/DONE 状态 + 已完成维度结果）</li>
     *   <li>非审核中：返回 {@code report} 完整审核报告（dimensionSummary + dimensions + judge）</li>
     *   <li>人工已确认 (status=4)：同时返回 {@code report} 与 {@code adminConfirm}（管理员裁决信息）</li>
     * </ul>
     * 配合 @JsonInclude(NON_NULL)，未涉及的段省略不返回。
     */
    @GetMapping("/{id}")
    public Result<ReviewDetailVO> getDetail(@PathVariable Long id) {
        return Result.success(reviewService.getDetail(id));
    }

    @PostMapping("/{id}/confirm")
    public Result<Void> confirm(
            @PathVariable Long id,
            @Valid @RequestBody ReviewConfirmDTO dto,
            @AuthenticationPrincipal AdminUserDetails current) {
        reviewService.confirmReview(id, dto, current.getAdminId().longValue());
        return Result.success();
    }
}
