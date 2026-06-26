package com.son.auramix.service.admin;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.son.auramix.common.exception.BusinessException;
import com.son.auramix.common.result.PageResult;
import com.son.auramix.common.result.ResultCode;
import com.son.auramix.domain.dto.admin.UserCreateDTO;
import com.son.auramix.domain.vo.admin.UserListItemVO;
import com.son.auramix.domain.entity.User;
import com.son.auramix.mapper.UserMapper;
import com.son.auramix.service.user.UserTokenStore;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserManageService {

    private final UserMapper userMapper;
    private final UserTokenStore tokenStore;
    private final PasswordEncoder passwordEncoder;

    /**
     * 分页查询用户列表
     */
    public PageResult<UserListItemVO> listUsers(String query, Integer status, Integer pageNum, Integer pageSize) {
        int current = pageNum == null || pageNum < 1 ? 1 : pageNum;
        int size = pageSize == null || pageSize < 1 ? 10 : (pageSize > 100 ? 100 : pageSize);
        Page<User> page = new Page<>(current, size);
        LambdaQueryWrapper<User> wrapper = new LambdaQueryWrapper<>();
        
        if (query != null && !query.isBlank()) {
            wrapper.and(w -> w.like(User::getDisplayName, query)
                    .or()
                    .like(User::getEmail, query));
        }
        if (status != null) {
            wrapper.eq(User::getStatus, status);
        }
        wrapper.orderByDesc(User::getId);

        Page<User> resultPage = userMapper.selectPage(page, wrapper);
        
        Page<UserListItemVO> voPage = new Page<>(resultPage.getCurrent(), resultPage.getSize(), resultPage.getTotal());
        voPage.setRecords(resultPage.getRecords().stream().map(this::toListItem).toList());
        
        return PageResult.of(voPage);
    }

    /**
     * 管理员创建用户
     */
    @Transactional
    public UserListItemVO createUser(UserCreateDTO req) {
        Long count = userMapper.selectCount(
                new LambdaQueryWrapper<User>().eq(User::getEmail, req.getEmail()));
        if (count != null && count > 0) {
            throw new BusinessException(ResultCode.USER_EMAIL_TAKEN);
        }

        User user = new User();
        user.setEmail(req.getEmail());
        user.setPasswordHash(passwordEncoder.encode(req.getPassword()));
        user.setDisplayName(req.getDisplayName());
        user.setCountry(req.getCountry() != null ? req.getCountry() : "CN");
        user.setProduct(0); // 默认免费级别
        user.setStatus(User.STATUS_ACTIVE);
        
        userMapper.insert(user);
        log.info("[UserManageService] Admin created user email={}, id={}", user.getEmail(), user.getId());
        return toListItem(user);
    }

    /**
     * 修改用户状态（封禁或启用）
     */
    @Transactional
    public void updateUserStatus(Long userId, Integer newStatus) {
        User user = userMapper.selectById(userId);
        if (user == null) {
            throw new BusinessException(ResultCode.USER_NOT_FOUND);
        }
        if (newStatus == null || (newStatus != User.STATUS_ACTIVE && newStatus != User.STATUS_BANNED)) {
            throw new BusinessException(ResultCode.BAD_REQUEST);
        }

        user.setStatus(newStatus);
        userMapper.updateById(user);

        // 如果被封禁，强制踢下线并清除 token
        if (newStatus == User.STATUS_BANNED) {
            tokenStore.revokeAllTokens(userId);
            log.info("[UserManageService] Banned user and revoked tokens for userId={}", userId);
        } else {
            log.info("[UserManageService] Activated user status for userId={}", userId);
        }
    }

    private UserListItemVO toListItem(User u) {
        return UserListItemVO.builder()
                .id(u.getId())
                .email(u.getEmail())
                .displayName(u.getDisplayName())
                .avatarUrl(u.getAvatarUrl())
                .country(u.getCountry())
                .product(u.getProduct())
                .status(u.getStatus())
                .createdAt(u.getCreatedAt())
                .build();
    }
}
