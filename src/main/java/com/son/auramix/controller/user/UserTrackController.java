package com.son.auramix.controller.user;

import com.son.auramix.annotation.AfterLog;
import com.son.auramix.common.result.Result;
import com.son.auramix.domain.vo.user.UserTrackDetailVO;
import com.son.auramix.service.user.UserTrackService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/user/tracks")
@RequiredArgsConstructor
public class UserTrackController {

    private final UserTrackService userTrackService;

    @AfterLog("播放歌曲")
    @GetMapping("/{id}")
    public Result<UserTrackDetailVO> getTrackDetail(@PathVariable Long id) {
        return Result.success(userTrackService.getTrackDetail(id));
    }
}
