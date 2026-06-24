package com.son.auramix.controller.admin;

import com.son.auramix.common.result.Result;
import com.son.auramix.domain.dto.admin.AdminCreateRequest;
import com.son.auramix.domain.dto.admin.AdminListItemResponse;
import com.son.auramix.domain.dto.admin.AdminPasswordResetRequest;
import com.son.auramix.domain.dto.admin.AdminProfileResponse;
import com.son.auramix.domain.dto.admin.AdminStatusUpdateRequest;
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

/**
 * 管理员管理接口（仅 ROOT_ADMIN）。自保护规则在 service 层：不可改自己、不可改初始管理员。
 */
@RestController
@RequestMapping("/api/admin/manage")
@RequiredArgsConstructor
@PreAuthorize("hasAuthority('ROOT_ADMIN')")
public class AdminManageController {

    private final AdminManageService manageService;

    /** POST /api/admin/manage/admins — 创建管理员。失败：USERNAME_TAKEN / EMAIL_TAKEN。 */
    @PostMapping("/admins")
    public Result<AdminProfileResponse> create(@Valid @RequestBody AdminCreateRequest req) {
        return Result.success(manageService.createAdmin(req));
    }

    /** GET /api/admin/manage/admins — 全量列表（按 id 升序）。 */
    @GetMapping("/admins")
    public Result<List<AdminListItemResponse>> list() {
        return Result.success(manageService.listAdmins());
    }

    /** GET /api/admin/manage/admins/{id} — 详情。id 不存在抛 ADMIN_NOT_FOUND。 */
    @GetMapping("/admins/{id}")
    public Result<AdminProfileResponse> get(@PathVariable Integer id) {
        return Result.success(manageService.getAdmin(id));
    }

    /** PUT /api/admin/manage/admins/{id}/password — 重置密码。成功撤销该用户所有 token。 */
    @PutMapping("/admins/{id}/password")
    public Result<Void> resetPassword(@PathVariable Integer id,
                                      @Valid @RequestBody AdminPasswordResetRequest req,
                                      @AuthenticationPrincipal AdminUserDetails current) {
        manageService.resetPassword(id, req.getNewPassword(), current.getAdminId());
        return Result.success();
    }

    /** PUT /api/admin/manage/admins/{id}/status — 启停账号。停用（status=0）或启用（status=1）。 */
    @PutMapping("/admins/{id}/status")
    public Result<Void> updateStatus(@PathVariable Integer id,
                                     @Valid @RequestBody AdminStatusUpdateRequest req,
                                     @AuthenticationPrincipal AdminUserDetails current) {
        manageService.updateStatus(id, req.getStatus(), current.getAdminId());
        return Result.success();
    }

    /** DELETE /api/admin/manage/admins/{id} — 删除管理员。 */
    @org.springframework.web.bind.annotation.DeleteMapping("/admins/{id}")
    public Result<Void> delete(@PathVariable Integer id,
                               @AuthenticationPrincipal AdminUserDetails current) {
        manageService.deleteAdmin(id, current.getAdminId());
        return Result.success();
    }
}
