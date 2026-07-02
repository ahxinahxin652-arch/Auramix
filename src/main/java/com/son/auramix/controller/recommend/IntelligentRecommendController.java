package com.son.auramix.controller.recommend;

import com.son.auramix.common.result.Result;
import com.son.auramix.domain.vo.user.RecommendTrackVO;
import com.son.auramix.security.user.UserPrincipal;
import com.son.auramix.service.recommend.TrackRecommendService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * 智能推荐 Controller
 * <p>
 * 提供相似歌曲推荐接口，供前端在播放页面（非 similar 来源）调用。
 * 前端在播放接口返回后，若 context != "similar"，调用此接口获取相似推荐歌单。
 */
@Slf4j
@RestController
@RequestMapping("/api/intelligent/recommend")
@RequiredArgsConstructor
public class IntelligentRecommendController {

    private final TrackRecommendService trackRecommendService;

    /**
     * 获取相似推荐歌单
     * <p>
     * 调用方式：播放接口中 context != "similar" 时，前端调用此接口。
     * 返回含播放信息的推荐歌曲列表（title/artists/cover/audioUrl + score/sources）。
     *
     * @param trackId 目标歌曲 ID（当前播放的歌曲）
     * @return 推荐歌曲列表
     *
     * <h3>请求示例</h3>
     * GET /api/intelligent/recommend/similar/{trackId}
     *
     * <h3>响应示例</h3>
     * <pre>
     * {
     *   "code": 200,
     *   "data": [
     *     {
     *             "trackId": "2071964795155652610",
     *             "title": "OMG",
     *             "albumTitle": "New Jeans Album",
     *             "coverUrl": "https://auramix.oss-cn-hangzhou.aliyuncs.com/cover/2026/06/28/9130dda32e514fcc8d9d60098a57f39c.jpg",
     *             "duration": 212,
     *             "artists": [
     *                 {
     *                     "id": "2070847436625997825",
     *                     "name": "New Jeans",
     *                     "role": 0
     *                 }
     *             ],
     *             "audioUrl": "https://auramix.oss-cn-hangzhou.aliyuncs.com/audio/2026/06/30/3954839fba7b470e84268a85210ee5b1.flac",
     *             "member": 0,
     *             "score": 0.3537324243528108,
     *             "sources": [
     *                 "content",
     *                 "culture"
     *             ]
     *         }
     *   ]
     * }
     * </pre>
     */
    @GetMapping("/similar/{trackId}")
    public Result<List<RecommendTrackVO>> getSimilarRecommendations(@PathVariable Long trackId) {
        Long userId = getCurrentUserId();
        if (userId == null) {
            return Result.success(List.of());
        }
        try {
            List<RecommendTrackVO> recommendations = trackRecommendService.getRecommendations(userId, trackId);
            return Result.success(recommendations);
        } catch (Exception e) {
            log.error("[相似推荐] 获取推荐失败 userId={}, trackId={}", userId, trackId, e);
            return Result.success(List.of());
        }
    }

    private Long getCurrentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        log.debug("[相似推荐] SecurityContext auth={}, principal={}", auth, auth != null ? auth.getPrincipal() : null);
        if (auth != null && auth.getPrincipal() instanceof UserPrincipal principal) {
            return principal.getUserId();
        }
        return null;
    }
}
