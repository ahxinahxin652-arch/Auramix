package com.son.auramix.controller.admin;

import com.son.auramix.common.result.PageResult;
import com.son.auramix.common.result.Result;
import com.son.auramix.domain.dto.admin.ArtistCreateRequest;
import com.son.auramix.domain.dto.admin.ArtistDetailResponse;
import com.son.auramix.domain.dto.admin.ArtistListItemResponse;
import com.son.auramix.domain.dto.admin.ArtistSearchResponse;
import com.son.auramix.domain.dto.admin.ArtistUpdateRequest;
import com.son.auramix.service.admin.ArtistManageService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/manage/artists")
@RequiredArgsConstructor
@PreAuthorize("hasAuthority('ROOT_ADMIN') or hasAuthority('ADMIN')")
public class AdminArtistManageController {
    private final ArtistManageService artistService;

    @GetMapping("/search")
    public Result<List<ArtistSearchResponse>> search(@RequestParam(required = false) String query) {
        return Result.success(artistService.searchArtists(query));
    }

    @GetMapping
    public Result<PageResult<ArtistListItemResponse>> list(
            @RequestParam(required = false) String query,
            @RequestParam(required = false, defaultValue = "1") Integer pageNum,
            @RequestParam(required = false, defaultValue = "10") Integer pageSize) {
        return Result.success(artistService.listArtists(query, pageNum, pageSize));
    }

    @GetMapping("/{id}")
    public Result<ArtistDetailResponse> get(@PathVariable Long id) {
        return Result.success(artistService.getArtistDetail(id));
    }

    @PostMapping
    public Result<Void> create(@Valid @RequestBody ArtistCreateRequest req) {
        artistService.createArtist(req);
        return Result.success();
    }

    @PutMapping("/{id}")
    public Result<Void> update(@PathVariable Long id, @Valid @RequestBody ArtistUpdateRequest req) {
        artistService.updateArtist(id, req);
        return Result.success();
    }

    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable Long id) {
        artistService.deleteArtist(id);
        return Result.success();
    }
}
