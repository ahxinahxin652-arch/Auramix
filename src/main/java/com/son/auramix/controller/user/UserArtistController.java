package com.son.auramix.controller.user;

import com.son.auramix.common.result.Result;
import com.son.auramix.domain.vo.user.UserArtistDetailVO;
import com.son.auramix.service.user.UserArtistService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
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

    @PostMapping("/{id}/follow")
    public Result<Void> follow(@PathVariable Long id) {
        userArtistService.followArtist(id);
        return Result.success(null, "已关注歌手");
    }

    @DeleteMapping("/{id}/unfollow")
    public Result<Void> unfollow(@PathVariable Long id) {
        userArtistService.unfollowArtist(id);
        return Result.success(null, "已取消关注");
    }
}
