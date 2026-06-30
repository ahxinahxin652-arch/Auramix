package com.son.auramix.controller.admin;

import com.son.auramix.common.result.PageResult;
import com.son.auramix.common.result.Result;
import com.son.auramix.domain.dto.analytics.AnalyticsDrillItem;
import com.son.auramix.domain.dto.analytics.CatalogAnalytics;
import com.son.auramix.domain.dto.analytics.MemberAnalytics;
import com.son.auramix.domain.dto.analytics.OverviewAnalytics;
import com.son.auramix.domain.dto.analytics.ReviewAnalytics;
import com.son.auramix.domain.dto.analytics.TrackAnalytics;
import com.son.auramix.domain.dto.analytics.UserAnalytics;
import com.son.auramix.service.analytics.AnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * 数据看板统一入口: /api/admin/manage/analytics/**
 */
@RestController
@RequestMapping("/api/admin/manage/analytics")
@RequiredArgsConstructor
@PreAuthorize("hasAuthority('ROOT_ADMIN') or hasAuthority('ADMIN')")
public class AdminAnalyticsController {

    private final AnalyticsService analyticsService;

    @GetMapping("/overview")
    public Result<OverviewAnalytics> overview(
            @RequestParam(required = false, defaultValue = "7d") String range,
            @RequestParam(required = false, defaultValue = "false") boolean forceRefresh) {
        return Result.success(analyticsService.overview(range, forceRefresh));
    }

    @GetMapping("/users")
    public Result<UserAnalytics> users(
            @RequestParam(required = false, defaultValue = "7d") String range,
            @RequestParam(required = false, defaultValue = "false") boolean forceRefresh) {
        return Result.success(analyticsService.users(range, forceRefresh));
    }

    @GetMapping("/tracks")
    public Result<TrackAnalytics> tracks(
            @RequestParam(required = false, defaultValue = "7d") String range,
            @RequestParam(required = false, defaultValue = "play") String orderBy,
            @RequestParam(required = false, defaultValue = "false") boolean forceRefresh) {
        return Result.success(analyticsService.tracks(range, orderBy, forceRefresh));
    }

    @GetMapping("/catalog")
    public Result<CatalogAnalytics> catalog(
            @RequestParam(required = false, defaultValue = "artist") String type,
            @RequestParam(required = false, defaultValue = "7d") String range,
            @RequestParam(required = false, defaultValue = "false") boolean forceRefresh) {
        return Result.success(analyticsService.catalog(type, range, forceRefresh));
    }

    @GetMapping("/reviews")
    public Result<ReviewAnalytics> reviews(
            @RequestParam(required = false, defaultValue = "7d") String range,
            @RequestParam(required = false, defaultValue = "false") boolean forceRefresh) {
        return Result.success(analyticsService.reviews(range, forceRefresh));
    }

    @GetMapping("/members")
    public Result<MemberAnalytics> members(
            @RequestParam(required = false, defaultValue = "7d") String range,
            @RequestParam(required = false, defaultValue = "false") boolean forceRefresh) {
        return Result.success(analyticsService.members(range, forceRefresh));
    }

    @GetMapping("/drill")
    public Result<PageResult<AnalyticsDrillItem>> drill(
            @RequestParam String module,
            @RequestParam(required = false) Long id,
            @RequestParam(required = false, defaultValue = "7d") String range,
            @RequestParam(required = false, defaultValue = "1") int page,
            @RequestParam(required = false, defaultValue = "10") int size) {
        return Result.success(analyticsService.drill(module, id, range, page, size));
    }
}