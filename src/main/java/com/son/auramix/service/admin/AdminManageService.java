package com.son.auramix.service.admin;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.son.auramix.common.exception.BusinessException;
import com.son.auramix.common.result.ResultCode;
import com.son.auramix.domain.dto.admin.AdminCreateDTO;
import com.son.auramix.domain.vo.admin.AdminListItemVO;
import com.son.auramix.domain.vo.admin.AdminProfileVO;
import com.son.auramix.domain.entity.Admin;
import com.son.auramix.mapper.AdminMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class AdminManageService {

    private final AdminMapper adminMapper;
    private final AdminTokenStore tokenStore;
    private final PasswordEncoder passwordEncoder;

    public AdminProfileVO createAdmin(AdminCreateDTO req) {
        Long usernameCount = adminMapper.selectCount(
                new LambdaQueryWrapper<Admin>().eq(Admin::getUsername, req.getUsername()));
        if (usernameCount != null && usernameCount > 0) {
            throw new BusinessException(ResultCode.ADMIN_USERNAME_TAKEN);
        }
        if (req.getEmail() != null && !req.getEmail().isBlank()) {
            Long emailCount = adminMapper.selectCount(
                    new LambdaQueryWrapper<Admin>().eq(Admin::getEmail, req.getEmail()));
            if (emailCount != null && emailCount > 0) {
                throw new BusinessException(ResultCode.ADMIN_EMAIL_TAKEN);
            }
        }
        Admin admin = new Admin();
        admin.setUsername(req.getUsername());
        admin.setPassword(passwordEncoder.encode(req.getPassword()));
        admin.setEmail(req.getEmail());
        admin.setIsRoot(0);
        admin.setStatus(1);
        adminMapper.insert(admin);
        log.info("[AdminManageService] created admin id={} username={}", admin.getId(), admin.getUsername());
        return toProfile(admin);
    }

    public List<AdminListItemVO> listAdmins() {
        List<Admin> rows = adminMapper.selectList(
                new LambdaQueryWrapper<Admin>().orderByDesc(Admin::getId));
        return rows.stream().map(this::toListItem).toList();
    }

    public AdminProfileVO getAdmin(Integer id) {
        Admin admin = mustExist(id);
        return toProfile(admin);
    }

    public void resetPassword(Integer targetId, String newPassword, Integer currentAdminId) {
        Admin target = mustExist(targetId);
        if (targetId.equals(currentAdminId)) {
            throw new BusinessException(ResultCode.ADMIN_CANNOT_MODIFY_SELF);
        }
        if (target.getIsRoot() != null && target.getIsRoot() == 1) {
            throw new BusinessException(ResultCode.ADMIN_CANNOT_MODIFY_ROOT);
        }
        target.setPassword(passwordEncoder.encode(newPassword));
        adminMapper.updateById(target);
        tokenStore.revokeAllTokens(targetId);
        log.info("[AdminManageService] reset password for adminId={} by currentAdminId={}", targetId, currentAdminId);
    }

    public void updateStatus(Integer targetId, Integer newStatus, Integer currentAdminId) {
        Admin target = mustExist(targetId);
        if (targetId.equals(currentAdminId)) {
            throw new BusinessException(ResultCode.ADMIN_CANNOT_MODIFY_SELF);
        }
        if (target.getIsRoot() != null && target.getIsRoot() == 1) {
            throw new BusinessException(ResultCode.ADMIN_CANNOT_MODIFY_ROOT);
        }
        if (newStatus == null || (newStatus != 0 && newStatus != 1)) {
            throw new BusinessException(ResultCode.BAD_REQUEST);
        }
        target.setStatus(newStatus);
        adminMapper.updateById(target);
        if (newStatus == 0) {
            tokenStore.revokeAllTokens(targetId);
        }
        log.info("[AdminManageService] updated status to {} for adminId={} by currentAdminId={}", newStatus, targetId, currentAdminId);
    }

    public void deleteAdmin(Integer targetId, Integer currentAdminId) {
        Admin target = mustExist(targetId);
        if (targetId.equals(currentAdminId)) {
            throw new BusinessException(ResultCode.ADMIN_CANNOT_MODIFY_SELF);
        }
        if (target.getIsRoot() != null && target.getIsRoot() == 1) {
            throw new BusinessException(ResultCode.ADMIN_CANNOT_MODIFY_ROOT);
        }
        adminMapper.deleteById(targetId);
        tokenStore.revokeAllTokens(targetId);
        log.info("[AdminManageService] deleted adminId={} by currentAdminId={}", targetId, currentAdminId);
    }

    private Admin mustExist(Integer id) {
        Admin admin = adminMapper.selectById(id);
        if (admin == null) {
            throw new BusinessException(ResultCode.ADMIN_NOT_FOUND);
        }
        return admin;
    }

    private AdminProfileVO toProfile(Admin a) {
        return AdminProfileVO.builder()
                .id(a.getId()).username(a.getUsername()).email(a.getEmail())
                .isRoot(a.getIsRoot()).status(a.getStatus())
                .lastLoginTime(a.getLastLoginTime()).lastLoginIp(a.getLastLoginIp())
                .createdAt(a.getCreatedAt()).build();
    }

    private AdminListItemVO toListItem(Admin a) {
        return AdminListItemVO.builder()
                .id(a.getId()).username(a.getUsername()).email(a.getEmail())
                .isRoot(a.getIsRoot()).status(a.getStatus())
                .lastLoginTime(a.getLastLoginTime()).createdAt(a.getCreatedAt()).build();
    }
}
