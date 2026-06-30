package com.son.auramix.service.report;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.son.auramix.common.exception.BusinessException;
import com.son.auramix.common.result.ResultCode;
import com.son.auramix.domain.dto.user.ReportFeedbackDTO;
import com.son.auramix.domain.entity.ReportFeedback;
import com.son.auramix.domain.entity.UserPeriodicReport;
import com.son.auramix.mapper.ReportFeedbackMapper;
import com.son.auramix.mapper.UserPeriodicReportMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * 报告查询 / 反馈 入口.
 */
@Service
@RequiredArgsConstructor
public class ReportQueryService {

    private final ReportGenerateService reportGenerateService;
    private final UserPeriodicReportMapper reportMapper;
    private final ReportFeedbackMapper feedbackMapper;

    public com.son.auramix.common.result.PageResult<com.son.auramix.domain.vo.user.ReportListItemVO> listMyReports(
            Long userId, Integer periodType, int pageNum, int pageSize) {
        return reportGenerateService.listMyReports(userId, periodType, pageNum, pageSize);
    }

    public com.son.auramix.domain.vo.user.ReportVO getReport(Long userId, Long reportId) {
        return reportGenerateService.getReport(userId, reportId);
    }

    @Transactional
    public void submitFeedback(Long userId, ReportFeedbackDTO dto) {
        UserPeriodicReport report = reportMapper.selectById(dto.getReportId());
        if (report == null || !report.getUserId().equals(userId)) {
            throw new BusinessException(ResultCode.NOT_FOUND);
        }
        ReportFeedback fb = new ReportFeedback();
        fb.setReportId(dto.getReportId());
        fb.setUserId(userId);
        fb.setRating(dto.getRating());
        fb.setComment(dto.getComment());
        feedbackMapper.insert(fb);
    }
}