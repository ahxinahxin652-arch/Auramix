package com.son.auramix.controller.user;


import com.son.auramix.annotation.AfterLog;
import com.son.auramix.common.result.Result;
import com.son.auramix.domain.vo.user.UserTrackDetailVO;
import com.son.auramix.service.user.UserTrackService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RestController
@RequestMapping("/api/user/tracks")
@RequiredArgsConstructor
public class UserTrackController {

    private final UserTrackService userTrackService;

    /**
     * 播放歌曲接口
     * <p>
     * 不返回相似推荐，相似推荐由前端在播放页调用
     * /api/intelligent/recommend/similar/{trackId} 获取
     *
     * @param id          track ID
     * @param contextType 播放来源: 0=歌单 1=专辑 2=歌手页 3=今日推荐
     *                    4=AI生成歌单 5=场景化推荐 6=发现模块 7=相似推荐
     * @param contextId   来源 ID（0-4 有值，5-7 可能为 NaN，已做安全解析）
     * @param duration    播放时长(ms)
     * @param context     上下文: home/recommend/discover/playlist/search
     */
    @AfterLog(value = "播放歌曲", behaviorType = 0)
    @GetMapping("/{id}")
    public Result<UserTrackDetailVO> getTrackDetail(
            @PathVariable Long id,
            @RequestParam(required = false) Integer contextType,
            @RequestParam(required = false) String contextId,
            @RequestParam(required = false) Integer duration,
            @RequestParam(required = false) String context
    ) {
        UserTrackDetailVO vo = userTrackService.getTrackDetail(id);

        // 安全解析 contextId（前端可能传 NaN）
        if (contextId != null && !contextId.isBlank() && !"NaN".equalsIgnoreCase(contextId)) {
            try {
                Long cid = Long.parseLong(contextId);
                log.debug("[播放] trackId={}, contextType={}, contextId={}, context={}",
                        id, contextType, cid, context);
            } catch (NumberFormatException e) {
                log.debug("[播放] contextId 解析失败: {}", contextId);
            }
        } else {
            log.debug("[播放] trackId={}, contextType={}, context={}", id, contextType, context);
        }

        return Result.success(vo);
    }
}
