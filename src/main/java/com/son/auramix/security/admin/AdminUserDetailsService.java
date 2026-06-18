package com.son.auramix.security.admin;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.son.auramix.entity.Admin;
import com.son.auramix.mapper.AdminMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * 按用户名加载 {@link AdminUserDetails}。
 * <p>
 * isRoot=1 -> authorities = [ROOT_ADMIN]
 * isRoot=0 -> authorities = [ADMIN]
 * <p>
 * 注：本类仅用于 {@code AuthenticationManager} 的标准流程；本项目登录走
 * {@link com.son.auramix.service.admin.AdminAuthService}，实际未必经过本类。
 * 但保留以便后续接入 formLogin / DaoAuthenticationProvider 时复用。
 */
@Service("adminUserDetailsService")
@RequiredArgsConstructor
public class AdminUserDetailsService implements UserDetailsService {

    public static final String AUTH_ROOT_ADMIN = "ROOT_ADMIN";
    public static final String AUTH_ADMIN = "ADMIN";

    private final AdminMapper adminMapper;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        Admin admin = adminMapper.selectOne(
                new LambdaQueryWrapper<Admin>().eq(Admin::getUsername, username));
        if (admin == null) {
            throw new UsernameNotFoundException("管理员不存在: " + username);
        }
        List<SimpleGrantedAuthority> authorities = admin.getIsRoot() != null && admin.getIsRoot() == 1
                ? List.of(new SimpleGrantedAuthority(AUTH_ROOT_ADMIN))
                : List.of(new SimpleGrantedAuthority(AUTH_ADMIN));
        return new AdminUserDetails(
                admin.getId(),
                admin.getUsername(),
                admin.getPassword(),
                admin.getIsRoot(),
                authorities
        );
    }
}
