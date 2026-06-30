package com.son.auramix.job;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.son.auramix.domain.dto.user.ReportGenerateDTO;
import com.son.auramix.domain.entity.User;
import com.son.auramix.mapper.UserMapper;
import com.son.auramix.service.report.PeriodRange;
import com.son.auramix.service.report.ReportGenerateService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

/**
 * 每月 1 号早 00:10 触发上月月报生成.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class MonthlyReportJob {

    private final UserMapper userMapper;
    private final ReportGenerateService reportGenerateService;

    @Scheduled(cron = "0 10 0 1 * *")
    public void run() {
        log.info("[MonthlyReportJob] 开始为所有用户生成上月月报");
        long okCount = 0, failCount = 0;
        for (User u : userMapper.selectList(
                new LambdaQueryWrapper<User>().eq(User::getStatus, User.STATUS_ACTIVE))) {
            try {
                ReportGenerateDTO dto = new ReportGenerateDTO();
                dto.setPeriodType(PeriodRange.TYPE_MONTHLY);
                reportGenerateService.triggerGenerate(u.getId(), dto);
                okCount++;
            } catch (Exception ex) {
                failCount++;
                log.warn("用户 {} 月报触发失败: {}", u.getId(), ex.getMessage());
            }
        }
        log.info("[MonthlyReportJob] 完成: ok={}, fail={}", okCount, failCount);
    }
}