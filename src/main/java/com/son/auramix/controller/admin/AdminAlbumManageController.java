package com.son.auramix.controller.admin;

import com.son.auramix.common.result.PageResult;
import com.son.auramix.common.result.Result;
import com.son.auramix.domain.dto.admin.AlbumDetailResponse;
import com.son.auramix.domain.dto.admin.AlbumListItemResponse;
import com.son.auramix.domain.dto.admin.AlbumQuickCreateRequest;
import com.son.auramix.domain.dto.admin.AlbumSearchResponse;
import com.son.auramix.domain.dto.admin.AlbumUpdateRequest;
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

    @GetMapping
    public Result<PageResult<AlbumListItemResponse>> list(
            @RequestParam(required = false) String query,
            @RequestParam(required = false, defaultValue = "1") Integer pageNum,
            @RequestParam(required = false, defaultValue = "10") Integer pageSize) {
        return Result.success(albumService.listAlbums(query, pageNum, pageSize));
    }

    @GetMapping("/{id}")
    public Result<AlbumDetailResponse> get(@PathVariable Long id) {
        return Result.success(albumService.getAlbumDetail(id));
    }

    @PutMapping("/{id}")
    public Result<Void> update(@PathVariable Long id, @Valid @RequestBody AlbumUpdateRequest req) {
        albumService.updateAlbum(id, req);
        return Result.success();
    }

    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable Long id) {
        albumService.deleteAlbum(id);
        return Result.success();
    }
}
