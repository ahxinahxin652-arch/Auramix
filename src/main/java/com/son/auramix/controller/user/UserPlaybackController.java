package com.son.auramix.controller.user;

import com.son.auramix.common.result.PageResult;
import com.son.auramix.common.result.Result;
import com.son.auramix.domain.dto.user.PlaybackRecordDTO;
import com.son.auramix.domain.vo.user.PlaybackHistoryVO;
import com.son.auramix.security.user.UserPrincipal;
import com.son.auramix.service.user.PlaybackHistoryService;
import com.son.auramix.service.user.PlaybackHistoryWriteService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

/**
 * 用户播放历史接口
 */
@Slf4j
@RestController
@RequestMapping("/api/user/playback")
@RequiredArgsConstructor
@PreAuthorize("hasAnyAuthority('ROOT_ADMIN', 'USER')")
public class UserPlaybackController {

    private final PlaybackHistoryService playbackHistoryService;
    private final PlaybackHistoryWriteService playbackHistoryWriteService;

    // ============================ 记录播放（异步写入） ============================

    @PostMapping("/addRecord")
    public Result<Void> record(@Valid @RequestBody PlaybackRecordDTO req) {
        Long userId = getCurrentUserId();
        playbackHistoryWriteService.recordPlaybackAsync(req, userId);
        return Result.success(null, "播放记录已提交");
    }

    // ============================ 播放历史列表 ============================

    @GetMapping("/getRecords")
    public Result<PageResult<PlaybackHistoryVO>> listHistory(
            @RequestParam(required = false, defaultValue = "1") Integer pageNum,
            @RequestParam(required = false, defaultValue = "20") Integer pageSize) {
        return Result.success(playbackHistoryService.listMyHistory(pageNum, pageSize));
    }

    // ============================ 清空播放历史 ============================

    @DeleteMapping("/clear")
    public Result<Void> clearHistory() {
        playbackHistoryService.clearMyHistory();
        return Result.success(null, "播放历史已清空");
    }

    // ============================ 工具方法 ============================

    private Long getCurrentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof UserPrincipal principal) {
            return principal.getUserId();
        }
        throw new RuntimeException("用户未登录");
    }
}
