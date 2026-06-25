package com.son.auramix.controller.admin;
import com.son.auramix.common.result.PageResult;
import com.son.auramix.common.result.Result;
import com.son.auramix.domain.dto.admin.TrackCreateDTO;
import com.son.auramix.domain.vo.admin.TrackDetailVO;
import com.son.auramix.domain.vo.admin.TrackListItemVO;
import com.son.auramix.domain.dto.admin.TrackUpdateDTO;
import com.son.auramix.service.admin.TrackService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/manage/tracks")
@RequiredArgsConstructor
@PreAuthorize("hasAuthority('ROOT_ADMIN') or hasAuthority('ADMIN')")
public class AdminTrackManageController {
    private final TrackService trackService;

    @GetMapping
    public Result<PageResult<TrackListItemVO>> list(
            @RequestParam(required = false) String query,
            @RequestParam(required = false) Long albumId,
            @RequestParam(required = false) Integer status,
            @RequestParam(required = false, defaultValue = "1") Integer pageNum,
            @RequestParam(required = false, defaultValue = "10") Integer pageSize) {
        return Result.success(trackService.listTracks(query, albumId, status, pageNum, pageSize));
    }

    @GetMapping("/{id}")
    public Result<TrackDetailVO> get(@PathVariable Long id) {
        TrackDetailVO detail = trackService.getTrackDetail(id);
        if (detail == null) {
            throw new com.son.auramix.common.exception.BusinessException(com.son.auramix.common.result.ResultCode.NOT_FOUND);
        }
        return Result.success(detail);
    }

    @PostMapping
    public Result<Void> create(@Valid @RequestBody TrackCreateDTO req) {
        trackService.createTrack(req);
        return Result.success();
    }

    @PutMapping("/{id}")
    public Result<Void> update(@PathVariable Long id, @Valid @RequestBody TrackUpdateDTO req) {
        trackService.updateTrack(id, req);
        return Result.success();
    }

    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable Long id) {
        trackService.deleteTrack(id);
        return Result.success();
    }
}
