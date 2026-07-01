package com.son.auramix.controller.user;

import com.son.auramix.annotation.AfterLog;
import com.son.auramix.common.exception.BusinessException;
import com.son.auramix.common.result.Result;
import com.son.auramix.common.result.ResultCode;
import com.son.auramix.domain.vo.user.RecommendTrackVO;
import com.son.auramix.domain.vo.user.UserTrackDetailVO;
import com.son.auramix.security.user.UserPrincipal;
import com.son.auramix.service.recommend.TrackRecommendService;
import com.son.auramix.service.user.UserTrackService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/user/tracks")
public class UserTrackController {

    private final UserTrackService userTrackService;
    private final TrackRecommendService trackRecommendService;

    public UserTrackController(UserTrackService userTrackService,
                               TrackRecommendService trackRecommendService) {
        this.userTrackService = userTrackService;
        this.trackRecommendService = trackRecommendService;
    }

    @AfterLog(value = "播放歌曲", behaviorType = 0)
    @GetMapping("/{id}")
    public Result<UserTrackDetailVO> getTrackDetail(
            @PathVariable Long id,
            @RequestParam(required = false) Integer contextType,
            @RequestParam(required = false) Long contextId,
            @RequestParam(required = false) Integer duration,
            @RequestParam(required = false) String context
    ) {
        UserTrackDetailVO vo = userTrackService.getTrackDetail(id);

        // 若 context 不为 "similar"，返回相似推荐歌单
        if (!"similar".equals(context)) {
            Long userId = getCurrentUserId();
            if (userId != null) {
                try {
                    List<RecommendTrackVO> recommendations = trackRecommendService.getRecommendations(userId, id);
                    vo.setSimilarTracks(recommendations);
                } catch (Exception e) {
                    log.error("[推荐] 获取推荐失败 userId={}, trackId={}", userId, id, e);
                }
            }
        }

        return Result.success(vo);
    }

    private Long getCurrentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof UserPrincipal principal) {
            return principal.getUserId();
        }
        return null;
    }
}
