package com.son.auramix.controller.admin;

import com.son.auramix.common.result.Result;
import com.son.auramix.dto.admin.AdminCreateRequest;
import com.son.auramix.dto.admin.AdminListItemResponse;
import com.son.auramix.dto.admin.AdminPasswordResetRequest;
import com.son.auramix.dto.admin.AdminProfileResponse;
import com.son.auramix.dto.admin.AdminStatusUpdateRequest;
import com.son.auramix.security.admin.AdminUserDetails;
import com.son.auramix.service.admin.AdminManageService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/admin/manage")
@RequiredArgsConstructor
@PreAuthorize("hasAuthority('ROOT_ADMIN')")
public class AdminManageController {

    private final AdminManageService manageService;

    @PostMapping("/admins")
    public Result<AdminProfileResponse> create(@Valid @RequestBody AdminCreateRequest req) {
        return Result.success(manageService.createAdmin(req));
    }

    @GetMapping("/admins")
    public Result<List<AdminListItemResponse>> list() {
        return Result.success(manageService.listAdmins());
    }

    @GetMapping("/admins/{id}")
    public Result<AdminProfileResponse> get(@PathVariable Integer id) {
        return Result.success(manageService.getAdmin(id));
    }

    @PutMapping("/admins/{id}/password")
    public Result<Void> resetPassword(@PathVariable Integer id,
                                      @Valid @RequestBody AdminPasswordResetRequest req,
                                      @AuthenticationPrincipal AdminUserDetails current) {
        manageService.resetPassword(id, req.getNewPassword(), current.getAdminId());
        return Result.success();
    }

    @PutMapping("/admins/{id}/status")
    public Result<Void> updateStatus(@PathVariable Integer id,
                                     @Valid @RequestBody AdminStatusUpdateRequest req,
                                     @AuthenticationPrincipal AdminUserDetails current) {
        manageService.updateStatus(id, req.getStatus(), current.getAdminId());
        return Result.success();
    }
}
