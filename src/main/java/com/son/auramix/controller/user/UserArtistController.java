package com.son.auramix.controller.user;

import com.son.auramix.common.result.Result;
import com.son.auramix.domain.vo.user.UserArtistDetailVO;
import com.son.auramix.service.user.UserArtistService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/user/artists")
@RequiredArgsConstructor
public class UserArtistController {

    private final UserArtistService userArtistService;

    @GetMapping("/{id}")
    public Result<UserArtistDetailVO> detail(@PathVariable Long id) {
        return Result.success(userArtistService.getArtistDetail(id));
    }
}
