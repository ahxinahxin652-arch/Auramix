package com.son.auramix.controller.admin;
import com.son.auramix.common.result.Result;
import com.son.auramix.domain.dto.admin.ArtistSearchResponse;
import com.son.auramix.service.admin.ArtistManageService;
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
}
