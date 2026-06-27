package com.son.auramix.controller.user;

import com.son.auramix.common.result.PageResult;
import com.son.auramix.common.result.Result;
import com.son.auramix.domain.vo.user.*;
import com.son.auramix.service.user.UserSearchService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/user/search")
@RequiredArgsConstructor
public class UserSearchController {

    private final UserSearchService userSearchService;

    @GetMapping
    public Result<?> search(
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "all") String type,
            @RequestParam(required = false, defaultValue = "1") Integer pageNum,
            @RequestParam(required = false, defaultValue = "10") Integer pageSize) {

        switch (type.toLowerCase()) {
            case "tracks":
                return Result.success(userSearchService.searchTracks(keyword, pageNum, pageSize));
            case "artists":
                return Result.success(userSearchService.searchArtists(keyword, pageNum, pageSize));
            case "albums":
                return Result.success(userSearchService.searchAlbums(keyword, pageNum, pageSize));
            case "playlists":
                return Result.success(userSearchService.searchPlaylists(keyword, pageNum, pageSize));
            case "all":
            default:
                return Result.success(userSearchService.searchAll(keyword));
        }
    }
}
