package com.son.auramix.controller.user;

import com.son.auramix.common.result.Result;
import com.son.auramix.domain.dto.user.UserBehaviorLogCreateDTO;
import com.son.auramix.domain.dto.user.UserBehaviorLogUpdateDTO;
import com.son.auramix.domain.vo.user.UserBehaviorLogVO;
import com.son.auramix.security.user.UserPrincipal;
import com.son.auramix.service.user.UserBehaviorLogService;
import com.son.auramix.service.user.UserBehaviorLogWriteService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

/**
 * 用户行为日志接口
 */
@Slf4j
@RequestMapping("/api/user/behavior")
@RestController
@RequiredArgsConstructor
@PreAuthorize("hasAnyAuthority('ROOT_ADMIN', 'USER')")
public class UserBehaviorController {

    private final UserBehaviorLogService userBehaviorLogService;
    private final UserBehaviorLogWriteService userBehaviorLogWriteService;

    // ============================ 新增行为日志（异步写入） ============================

    @PostMapping("/addRecord")
    public Result<Void> addRecord(@Valid @RequestBody UserBehaviorLogCreateDTO req) {
        Long userId = getCurrentUserId();
        userBehaviorLogWriteService.createAsync(req, userId);
        return Result.success(null, "行为日志已提交");
    }

    // ============================ 修改行为日志（同步，低频操作） ============================

    @PutMapping("/{logId}")
    public Result<UserBehaviorLogVO> updateRecord(@PathVariable Long logId,
                                                  @Valid @RequestBody UserBehaviorLogUpdateDTO req) {
        UserBehaviorLogVO resp = userBehaviorLogService.update(logId, req);
        return Result.success(resp, "行为日志已更新");
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
