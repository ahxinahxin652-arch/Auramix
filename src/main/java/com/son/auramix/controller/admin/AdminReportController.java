package com.son.auramix.controller.admin;

import com.son.auramix.common.result.PageResult;
import com.son.auramix.common.result.Result;
import com.son.auramix.domain.dto.admin.AdminReportRegenerateDTO;
import com.son.auramix.domain.vo.admin.AdminReportListItemVO;
import com.son.auramix.domain.vo.user.ReportVO;
import com.son.auramix.service.report.AdminReportService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * Admin 报告管理接口: /api/admin/manage/reports/**
 * <p>
 * 职责: 列出所有用户的报告, 查看任意报告, 强制重生成.
 * 与 /api/user/reports/** 平行, 不互相调用.
 */
@RestController
@RequestMapping("/api/admin/manage/reports")
@RequiredArgsConstructor
@PreAuthorize("hasAuthority('ROOT_ADMIN') or hasAuthority('ADMIN')")
public class AdminReportController {

    private final AdminReportService adminReportService;

    @GetMapping
    public Result<PageResult<AdminReportListItemVO>> list(
            @RequestParam(required = false) Integer periodType,
            @RequestParam(required = false) Integer status,
            @RequestParam(required = false) String userKeyword,
            @RequestParam(required = false, defaultValue = "1") Integer pageNum,
            @RequestParam(required = false, defaultValue = "10") Integer pageSize) {
        return Result.success(
                adminReportService.listReports(periodType, status, userKeyword, pageNum, pageSize));
    }

    @GetMapping("/{id}")
    public Result<ReportVO> get(@PathVariable Long id) {
        return Result.success(adminReportService.getReportAdmin(id));
    }

    @PostMapping("/regenerate")
    public Result<Long> regenerate(@Valid @RequestBody AdminReportRegenerateDTO dto) {
        Long reportId = adminReportService.regenerateForUser(dto.getUserId(), dto.getPeriodType());
        return Result.success(reportId, "已提交重生成任务");
    }
}