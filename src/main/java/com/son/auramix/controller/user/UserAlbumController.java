package com.son.auramix.controller.user;

import com.son.auramix.common.result.Result;
import com.son.auramix.domain.vo.user.UserAlbumDetailVO;
import com.son.auramix.service.user.UserAlbumService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/user/albums")
@RequiredArgsConstructor
public class UserAlbumController {

    private final UserAlbumService userAlbumService;

    @GetMapping("/{id}")
    public Result<UserAlbumDetailVO> detail(@PathVariable Long id) {
        return Result.success(userAlbumService.getAlbumDetail(id));
    }
}
