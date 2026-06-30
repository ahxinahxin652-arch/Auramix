package com.son.auramix.service.report;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.son.auramix.common.exception.BusinessException;
import com.son.auramix.common.result.PageResult;
import com.son.auramix.common.result.ResultCode;
import com.son.auramix.domain.dto.user.ReportGenerateDTO;
import com.son.auramix.domain.entity.User;
import com.son.auramix.domain.entity.UserPeriodicReport;
import com.son.auramix.domain.vo.admin.AdminReportListItemVO;
import com.son.auramix.domain.vo.user.ReportVO;
import com.son.auramix.mapper.UserMapper;
import com.son.auramix.mapper.UserPeriodicReportMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Admin 视角的报告管理服务.
 * <p>
 * 与 C 端 ReportGenerateService 平行, 不动原有方法.
 */
@Service
@RequiredArgsConstructor
public class AdminReportService {

    private final UserPeriodicReportMapper reportMapper;
    private final UserMapper userMapper;
    private final ReportGenerateService reportGenerateService;

    /**
     * 分页列出所有报告, 支持按周期类型 / 状态 / 用户关键字过滤.
     */
    public PageResult<AdminReportListItemVO> listReports(
            Integer periodType, Integer status, String userKeyword, int pageNum, int pageSize) {

        Page<UserPeriodicReport> page = new Page<>(pageNum, pageSize);
        LambdaQueryWrapper<UserPeriodicReport> wrapper = new LambdaQueryWrapper<UserPeriodicReport>()
                .orderByDesc(UserPeriodicReport::getCreatedAt);
        if (periodType != null) wrapper.eq(UserPeriodicReport::getPeriodType, periodType);
        if (status != null) wrapper.eq(UserPeriodicReport::getStatus, status);

        // 如果给了 userKeyword, 先查到 userId 集合再过滤
        if (userKeyword != null && !userKeyword.trim().isEmpty()) {
            String kw = userKeyword.trim();
            List<User> matched = userMapper.selectList(
                    new LambdaQueryWrapper<User>()
                            .like(User::getEmail, kw)
                            .or().like(User::getDisplayName, kw));
            if (matched.isEmpty()) {
                return new PageResult<>(pageNum, pageSize, 0, 0, List.of());
            }
            Set<Long> userIds = matched.stream().map(User::getId).collect(Collectors.toSet());
            wrapper.in(UserPeriodicReport::getUserId, userIds);
        }

        reportMapper.selectPage(page, wrapper);

        // 批量补全 user 信息
        List<AdminReportListItemVO> records = page.getRecords().stream()
                .map(this::toAdminItem)
                .collect(Collectors.toList());

        // 再批量加载 user map (避免每条都查一次)
        if (!records.isEmpty()) {
            Set<Long> uids = records.stream().map(AdminReportListItemVO::getUserId).collect(Collectors.toSet());
            Map<Long, User> userMap = userMapper.selectBatchIds(uids).stream()
                    .collect(Collectors.toMap(User::getId, u -> u, (a, b) -> a));
            for (AdminReportListItemVO vo : records) {
                User u = userMap.get(vo.getUserId());
                if (u != null) {
                    vo.setUserEmail(u.getEmail());
                    vo.setUserDisplayName(u.getDisplayName());
                }
            }
        }

        return new PageResult<>(page.getCurrent(), page.getSize(), page.getTotal(), page.getPages(), records);
    }

    /**
     * 管理员查看任意报告详情.
     */
    public ReportVO getReportAdmin(Long reportId) {
        UserPeriodicReport r = reportMapper.selectById(reportId);
        if (r == null) {
            throw new BusinessException(ResultCode.NOT_FOUND);
        }
        return toVO(r);
    }

    private ReportVO toVO(UserPeriodicReport r) {
        ReportVO vo = new ReportVO();
        vo.setId(r.getId());
        vo.setUserId(r.getUserId());
        vo.setPeriodType(r.getPeriodType());
        vo.setPeriodTypeLabel(r.getPeriodType() == null ? "未知" : (r.getPeriodType() == 1 ? "周报" : "月报"));
        vo.setPeriodStart(r.getPeriodStart() == null ? null : r.getPeriodStart().toString());
        vo.setPeriodEnd(r.getPeriodEnd() == null ? null : r.getPeriodEnd().toString());
        vo.setStatus(r.getStatus());
        vo.setStatusLabel(statusLabel(r.getStatus()));
        vo.setErrorMessage(r.getErrorMessage());
        vo.setSummary(r.getLlmSummary());
        if (r.getMoodTags() != null && !r.getMoodTags().isEmpty()) {
            vo.setMoodTags(java.util.Arrays.stream(r.getMoodTags().split(","))
                    .map(String::trim).filter(s -> !s.isEmpty()).collect(Collectors.toList()));
        } else {
            vo.setMoodTags(List.of());
        }
        // highlights / recommendations 是 JSON, 简化处理: 用空数组占位
        // (admin 详情页前端不会用, 只展示 summary/status; 完整 JSON 解析放 C 端逻辑)
        vo.setHighlights(List.of());
        vo.setRecommendations(List.of());
        vo.setStatsSnapshotJson(r.getStatsSnapshot());
        vo.setGeneratedAt(r.getGeneratedAt() == null ? null : r.getGeneratedAt().toString());
        vo.setCreatedAt(r.getCreatedAt() == null ? null : r.getCreatedAt().toString());
        return vo;
    }

    /**
     * 管理员强制重生成某用户的报告.
     */
    @Transactional
    public Long regenerateForUser(Long userId, Integer periodType) {
        User u = userMapper.selectById(userId);
        if (u == null) {
            throw new BusinessException(ResultCode.BAD_REQUEST, "用户不存在");
        }
        ReportGenerateDTO dto = new ReportGenerateDTO();
        dto.setPeriodType(periodType);
        return reportGenerateService.triggerGenerate(userId, dto);
    }

    private AdminReportListItemVO toAdminItem(UserPeriodicReport r) {
        AdminReportListItemVO vo = new AdminReportListItemVO();
        vo.setId(r.getId());
        vo.setUserId(r.getUserId());
        vo.setPeriodType(r.getPeriodType());
        vo.setPeriodStart(r.getPeriodStart() == null ? null : r.getPeriodStart().toString());
        vo.setPeriodEnd(r.getPeriodEnd() == null ? null : r.getPeriodEnd().toString());
        vo.setStatus(r.getStatus());
        vo.setStatusLabel(statusLabel(r.getStatus()));
        vo.setGeneratedAt(r.getGeneratedAt() == null ? null : r.getGeneratedAt().toString());
        vo.setTitle(buildTitle(r));
        return vo;
    }

    private String buildTitle(UserPeriodicReport r) {
        String type = r.getPeriodType() == null ? "未知" : (r.getPeriodType() == 1 ? "周报" : "月报");
        return String.format("%s (%s ~ %s)", type,
                r.getPeriodStart() == null ? "" : r.getPeriodStart().toString(),
                r.getPeriodEnd() == null ? "" : r.getPeriodEnd().toString());
    }

    private String statusLabel(Integer status) {
        if (status == null) return "未知";
        return switch (status) {
            case 0 -> "生成中";
            case 1 -> "已生成";
            case 2 -> "失败";
            case 3 -> "无数据";
            default -> "未知";
        };
    }
}