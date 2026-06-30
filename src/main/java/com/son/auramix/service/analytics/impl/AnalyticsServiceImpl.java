package com.son.auramix.service.analytics.impl;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.son.auramix.common.result.PageResult;
import com.son.auramix.domain.dto.analytics.AnalyticsDrillItem;
import com.son.auramix.domain.dto.analytics.CatalogAnalytics;
import com.son.auramix.domain.dto.analytics.MemberAnalytics;
import com.son.auramix.domain.dto.analytics.OverviewAnalytics;
import com.son.auramix.domain.dto.analytics.ReviewAnalytics;
import com.son.auramix.domain.dto.analytics.TrackAnalytics;
import com.son.auramix.domain.dto.analytics.UserAnalytics;
import com.son.auramix.service.analytics.AnalyticsService;
import com.son.auramix.service.analytics.CatalogAnalyticsService;
import com.son.auramix.service.analytics.MemberAnalyticsService;
import com.son.auramix.service.analytics.OverviewAnalyticsService;
import com.son.auramix.service.analytics.ReviewAnalyticsService;
import com.son.auramix.service.analytics.TrackAnalyticsService;
import com.son.auramix.service.analytics.UserAnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * 数据看板顶层实现: 简单委托给 6 个维度 Service.
 * <p>
 * drill / export 在本类直接实现 (无需额外 Service).
 */
@Service
@RequiredArgsConstructor
public class AnalyticsServiceImpl implements AnalyticsService {

    private final OverviewAnalyticsService overviewService;
    private final UserAnalyticsService userService;
    private final TrackAnalyticsService trackService;
    private final CatalogAnalyticsService catalogService;
    private final ReviewAnalyticsService reviewService;
    private final MemberAnalyticsService memberService;

    @Override
    public OverviewAnalytics overview(String range, boolean forceRefresh) {
        return overviewService.compute(parse(range), forceRefresh);
    }

    @Override
    public UserAnalytics users(String range, boolean forceRefresh) {
        return userService.compute(parse(range), forceRefresh);
    }

    @Override
    public TrackAnalytics tracks(String range, String orderBy, boolean forceRefresh) {
        return trackService.compute(parse(range), orderBy, forceRefresh);
    }

    @Override
    public CatalogAnalytics catalog(String type, String range, boolean forceRefresh) {
        return catalogService.compute(type, parse(range), forceRefresh);
    }

    @Override
    public ReviewAnalytics reviews(String range, boolean forceRefresh) {
        return reviewService.compute(parse(range), forceRefresh);
    }

    @Override
    public MemberAnalytics members(String range, boolean forceRefresh) {
        return memberService.compute(parse(range), forceRefresh);
    }

    /**
     * 简化版下钻: 当前仅返回分页空集, 等前端确定具体下钻需求后再细化.
     */
    @Override
    public PageResult<AnalyticsDrillItem> drill(String module, Long id, String range, int page, int size) {
        // 留作 P2 阶段实现 (按 module/id 返回明细列表)
        return new PageResult<>(page, size, 0, 0, List.of());
    }

    /**
     * 简化版导出: 返回表头 + 当前空数据. 实际写入由 AdminExportController 完成.
     */
    @Override
    public List<String[]> export(String module, String range) {
        return List.of(new String[]{"module", "range", "message"},
                new String[]{module == null ? "" : module, range == null ? "" : range,
                        "数据导出功能将在 P2 阶段实现"});
    }

    private com.son.auramix.service.analytics.AnalyticsRange parse(String range) {
        return com.son.auramix.service.analytics.AnalyticsRange.parse(range);
    }

    // 静态分页结果包装 (避免编译期对 Page 类型的依赖冲突)
    @SuppressWarnings("unused")
    private static <T> PageResult<T> emptyPage(int page, int size) {
        Page<T> p = new Page<>(page, size, 0);
        return new PageResult<>(p.getCurrent(), p.getSize(), p.getTotal(), p.getPages(), List.of());
    }
}