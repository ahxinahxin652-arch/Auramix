package com.son.auramix.controller.admin;

import com.son.auramix.common.result.PageResult;
import com.son.auramix.common.result.Result;
import com.son.auramix.domain.vo.admin.AlbumDetailVO;
import com.son.auramix.domain.vo.admin.AlbumListItemVO;
import com.son.auramix.domain.dto.admin.AlbumQuickCreateDTO;
import com.son.auramix.domain.vo.admin.AlbumSearchVO;
import com.son.auramix.domain.dto.admin.AlbumUpdateDTO;
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
    public Result<List<AlbumSearchVO>> search(@RequestParam(required = false) String query) {
        return Result.success(albumService.searchAlbums(query));
    }

    @PostMapping("/quick")
    public Result<AlbumSearchVO> quickCreate(@Valid @RequestBody AlbumQuickCreateDTO req) {
        return Result.success(albumService.quickCreate(req));
    }

    @GetMapping
    public Result<PageResult<AlbumListItemVO>> list(
            @RequestParam(required = false) String query,
            @RequestParam(required = false, defaultValue = "1") Integer pageNum,
            @RequestParam(required = false, defaultValue = "10") Integer pageSize) {
        return Result.success(albumService.listAlbums(query, pageNum, pageSize));
    }

    @GetMapping("/{id}")
    public Result<AlbumDetailVO> get(@PathVariable Long id) {
        return Result.success(albumService.getAlbumDetail(id));
    }

    @PutMapping("/{id}")
    public Result<Void> update(@PathVariable Long id, @Valid @RequestBody AlbumUpdateDTO req) {
        albumService.updateAlbum(id, req);
        return Result.success();
    }

    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable Long id) {
        albumService.deleteAlbum(id);
        return Result.success();
    }
}
