package com.son.auramix.controller.admin;
import com.son.auramix.common.result.Result;
import com.son.auramix.domain.dto.admin.AlbumQuickCreateRequest;
import com.son.auramix.domain.dto.admin.AlbumSearchResponse;
import com.son.auramix.service.admin.AlbumManageService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/admin/manage/albums")
@RequiredArgsConstructor
@PreAuthorize("hasAuthority('ROOT_ADMIN') or hasAuthority('ADMIN')")
public class AdminAlbumManageController {
    private final AlbumManageService albumService;

    @GetMapping("/search")
    public Result<List<AlbumSearchResponse>> search(@RequestParam(required = false) String query) {
        return Result.success(albumService.searchAlbums(query));
    }

    @PostMapping("/quick")
    public Result<AlbumSearchResponse> quickCreate(@Valid @RequestBody AlbumQuickCreateRequest req) {
        return Result.success(albumService.quickCreate(req));
    }
}
