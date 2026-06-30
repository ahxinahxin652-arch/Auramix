package com.son.auramix.service.analytics;

import com.son.auramix.domain.dto.analytics.AnalyticsDrillItem;
import com.son.auramix.domain.dto.analytics.CatalogAnalytics;
import com.son.auramix.domain.dto.analytics.MemberAnalytics;
import com.son.auramix.domain.dto.analytics.OverviewAnalytics;
import com.son.auramix.domain.dto.analytics.ReviewAnalytics;
import com.son.auramix.domain.dto.analytics.TrackAnalytics;
import com.son.auramix.domain.dto.analytics.UserAnalytics;
import com.son.auramix.common.result.PageResult;

import java.util.List;

/**
 * 数据看板顶层接口.
 * <p>
 * 6 个维度: overview / user / track / catalog / review / member.
 * 另有下钻(drill)和导出(export)入口.
 */
public interface AnalyticsService {

    OverviewAnalytics overview(String range, boolean forceRefresh);

    UserAnalytics users(String range, boolean forceRefresh);

    TrackAnalytics tracks(String range, String orderBy, boolean forceRefresh);

    CatalogAnalytics catalog(String type, String range, boolean forceRefresh);

    ReviewAnalytics reviews(String range, boolean forceRefresh);

    MemberAnalytics members(String range, boolean forceRefresh);

    PageResult<AnalyticsDrillItem> drill(String module, Long id, String range, int page, int size);

    /**
     * 流式导出 CSV. 调用方负责写入 HttpServletResponse.
     */
    List<String[]> export(String module, String range);
}