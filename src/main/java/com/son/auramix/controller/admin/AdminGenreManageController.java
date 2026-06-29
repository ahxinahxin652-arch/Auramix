package com.son.auramix.controller.admin;

import com.son.auramix.common.result.PageResult;
import com.son.auramix.common.result.Result;
import com.son.auramix.domain.dto.admin.GenreCreateDTO;
import com.son.auramix.domain.dto.admin.GenreUpdateDTO;
import com.son.auramix.domain.dto.admin.TrackGenreBindDTO;
import com.son.auramix.domain.vo.admin.GenreVO;
import com.son.auramix.service.admin.GenreManageService;
import lombok.RequiredArgsConstructor;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/genre")
@RequiredArgsConstructor
public class AdminGenreManageController {

    private final GenreManageService genreManageService;

    // ==========================================
    // 流派基础管理
    // ==========================================

    @GetMapping("/list")
    public Result<PageResult<GenreVO>> listGenres(
            @RequestParam(required = false) String query,
            @RequestParam(required = false) Integer pageNum,
            @RequestParam(required = false) Integer pageSize) {
        return Result.success(genreManageService.listGenres(query, pageNum, pageSize));
    }

    @GetMapping("/all")
    public Result<List<GenreVO>> getAllGenres() {
        return Result.success(genreManageService.getAllGenres());
    }

    @PostMapping("/add")
    public Result<Void> addGenre(@Validated @RequestBody GenreCreateDTO req) {
        genreManageService.addGenre(req);
        return Result.success();
    }

    @PutMapping("/update/{id}")
    public Result<Void> updateGenre(@PathVariable Long id, @Validated @RequestBody GenreUpdateDTO req) {
        genreManageService.updateGenre(id, req);
        return Result.success();
    }

    @DeleteMapping("/delete/{id}")
    public Result<Void> deleteGenre(@PathVariable Long id) {
        genreManageService.deleteGenre(id);
        return Result.success();
    }

    // ==========================================
    // 歌曲流派关联管理
    // ==========================================

    @GetMapping("/track/{trackId}")
    public Result<List<GenreVO>> getGenresByTrackId(@PathVariable Long trackId) {
        return Result.success(genreManageService.getGenresByTrackId(trackId));
    }

    @PostMapping("/track/bind")
    public Result<Void> bindGenresToTrack(@Validated @RequestBody TrackGenreBindDTO req) {
        genreManageService.bindGenresToTrack(req);
        return Result.success();
    }

    @PostMapping("/track/unbind")
    public Result<Void> unbindGenreFromTrack(@RequestParam Long trackId, @RequestParam Long genreId) {
        genreManageService.unbindGenreFromTrack(trackId, genreId);
        return Result.success();
    }
}
