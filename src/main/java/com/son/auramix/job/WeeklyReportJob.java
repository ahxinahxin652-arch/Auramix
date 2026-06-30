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
 * 每周一早 00:05 触发上周周报生成.
 * 对每个活跃用户 (status=0) 调一次 triggerGenerate.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class WeeklyReportJob {

    private final UserMapper userMapper;
    private final ReportGenerateService reportGenerateService;

    @Scheduled(cron = "0 5 0 ? * MON")
    public void run() {
        log.info("[WeeklyReportJob] 开始为所有用户生成上周周报");
        long okCount = 0, failCount = 0;
        for (User u : userMapper.selectList(
                new LambdaQueryWrapper<User>().eq(User::getStatus, User.STATUS_ACTIVE))) {
            try {
                ReportGenerateDTO dto = new ReportGenerateDTO();
                dto.setPeriodType(PeriodRange.TYPE_WEEKLY);
                reportGenerateService.triggerGenerate(u.getId(), dto);
                okCount++;
            } catch (Exception ex) {
                failCount++;
                log.warn("用户 {} 周报触发失败: {}", u.getId(), ex.getMessage());
            }
        }
        log.info("[WeeklyReportJob] 完成: ok={}, fail={}", okCount, failCount);
    }
}