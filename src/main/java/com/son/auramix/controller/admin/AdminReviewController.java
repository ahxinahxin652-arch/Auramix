package com.son.auramix.controller.admin;

import com.son.auramix.common.result.PageResult;
import com.son.auramix.common.result.Result;
import com.son.auramix.domain.dto.admin.ReviewConfirmDTO;
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

    @PostMapping("/{id}/confirm")
    public Result<Void> confirm(
            @PathVariable Long id,
            @Valid @RequestBody ReviewConfirmDTO dto,
            @AuthenticationPrincipal AdminUserDetails current) {
        reviewService.confirmReview(id, dto, current.getAdminId().longValue());
        return Result.success();
    }
}
