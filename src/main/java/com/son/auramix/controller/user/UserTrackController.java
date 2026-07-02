package com.son.auramix.controller.user;


import com.son.auramix.annotation.AfterLog;
import com.son.auramix.common.result.Result;
import com.son.auramix.domain.vo.user.UserTrackDetailVO;
import com.son.auramix.service.user.UserTrackService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

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
     */
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
        return Result.success(vo);
    }
}
