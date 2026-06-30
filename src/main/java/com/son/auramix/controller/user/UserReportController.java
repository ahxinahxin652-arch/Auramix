package com.son.auramix.controller.user;

import com.son.auramix.common.exception.BusinessException;
import com.son.auramix.common.result.PageResult;
import com.son.auramix.common.result.Result;
import com.son.auramix.common.result.ResultCode;
import com.son.auramix.domain.dto.user.ReportFeedbackDTO;
import com.son.auramix.domain.dto.user.ReportGenerateDTO;
import com.son.auramix.domain.vo.user.ReportListItemVO;
import com.son.auramix.domain.vo.user.ReportVO;
import com.son.auramix.security.user.UserPrincipal;
import com.son.auramix.service.report.ReportGenerateService;
import com.son.auramix.service.report.ReportQueryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * C 端用户报告接口: /api/user/reports/**
 */
@RestController
@RequestMapping("/api/user/reports")
@RequiredArgsConstructor
public class UserReportController {

    private final ReportGenerateService reportGenerateService;
    private final ReportQueryService reportQueryService;

    private Long getCurrentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof UserPrincipal principal) {
            return principal.getUserId();
        }
        throw new BusinessException(ResultCode.UNAUTHORIZED);
    }

    /**
     * 手动触发生成报告 (异步).
     */
    @PostMapping("/generate")
    public Result<Long> generate(@Valid @RequestBody ReportGenerateDTO dto) {
        Long userId = getCurrentUserId();
        Long reportId = reportGenerateService.triggerGenerate(userId, dto);
        return Result.success(reportId, "已提交生成任务，请稍后查询");
    }

    /**
     * 查询我的报告列表.
     */
    @GetMapping
    public Result<PageResult<ReportListItemVO>> list(
            @RequestParam(required = false) Integer periodType,
            @RequestParam(required = false, defaultValue = "1") Integer pageNum,
            @RequestParam(required = false, defaultValue = "10") Integer pageSize) {
        Long userId = getCurrentUserId();
        return Result.success(reportQueryService.listMyReports(userId, periodType, pageNum, pageSize));
    }

    /**
     * 查询报告详情.
     */
    @GetMapping("/{id}")
    public Result<ReportVO> detail(@PathVariable Long id) {
        Long userId = getCurrentUserId();
        return Result.success(reportQueryService.getReport(userId, id));
    }

    /**
     * 提交反馈 (赞/踩 + 文字).
     */
    @PostMapping("/feedback")
    public Result<Void> feedback(@Valid @RequestBody ReportFeedbackDTO dto) {
        Long userId = getCurrentUserId();
        reportQueryService.submitFeedback(userId, dto);
        return Result.success(null, "反馈已提交");
    }
}