package com.son.auramix.controller.admin;

import com.son.auramix.common.result.PageResult;
import com.son.auramix.common.result.Result;
import com.son.auramix.domain.dto.admin.UserCreateRequest;
import com.son.auramix.domain.dto.admin.UserListItemResponse;
import com.son.auramix.domain.dto.admin.UserStatusUpdateRequest;
import com.son.auramix.service.admin.UserManageService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/manage")
@RequiredArgsConstructor
@PreAuthorize("hasAuthority('ROOT_ADMIN') or hasAuthority('ADMIN')")
public class AdminUserManageController {

    private final UserManageService userManageService;

    /**
     * GET /api/admin/manage/users - 用户列表分页查询
     */
    @GetMapping("/users")
    public Result<PageResult<UserListItemResponse>> listUsers(
            @RequestParam(required = false) String query,
            @RequestParam(required = false) Integer status,
            @RequestParam(required = false, defaultValue = "1") Integer pageNum,
            @RequestParam(required = false, defaultValue = "10") Integer pageSize) {
        return Result.success(userManageService.listUsers(query, status, pageNum, pageSize));
    }

    /**
     * POST /api/admin/manage/users - 新增用户
     */
    @PostMapping("/users")
    public Result<UserListItemResponse> createUser(@Valid @RequestBody UserCreateRequest req) {
        return Result.success(userManageService.createUser(req));
    }

    /**
     * PUT /api/admin/manage/users/{id}/status - 封禁/解封用户状态
     */
    @PutMapping("/users/{id}/status")
    public Result<Void> updateUserStatus(
            @PathVariable Long id,
            @Valid @RequestBody UserStatusUpdateRequest req) {
        userManageService.updateUserStatus(id, req.getStatus());
        return Result.success();
    }
}
