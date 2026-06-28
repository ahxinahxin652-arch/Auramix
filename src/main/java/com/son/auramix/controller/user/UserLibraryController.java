package com.son.auramix.controller.user;

import com.son.auramix.common.exception.BusinessException;
import com.son.auramix.common.result.Result;
import com.son.auramix.common.result.ResultCode;
import com.son.auramix.domain.vo.user.UserLibrarySyncVO;
import com.son.auramix.security.user.UserPrincipal;
import com.son.auramix.service.user.UserLibraryService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/user/library")
@RequiredArgsConstructor
public class UserLibraryController {

    private final UserLibraryService userLibraryService;

    private Long getCurrentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof UserPrincipal principal) {
            return principal.getUserId();
        }
        throw new BusinessException(ResultCode.UNAUTHORIZED);
    }

    @GetMapping("/sync")
    public Result<UserLibrarySyncVO> sync() {
        Long userId = getCurrentUserId();
        return Result.success(userLibraryService.getLibrarySyncData(userId), "同步成功");
    }
}
