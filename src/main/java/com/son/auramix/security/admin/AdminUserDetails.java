package com.son.auramix.security.admin;

import lombok.Getter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.User;

import java.util.Collection;

/**
 * Spring Security 的 {@link User} 扩展，多带 {@code id} / {@code isRoot}。
 * <p>
 * 放在 SecurityContext 的 principal 中，业务侧可通过 {@code @AuthenticationPrincipal}
 * 拿到本类并读 id。
 */
@Getter
public class AdminUserDetails extends User {

    /** 管理员主键 ID */
    private final Integer adminId;

    /** 是否初始管理员（1=是） */
    private final Integer isRoot;

    public AdminUserDetails(Integer adminId,
                            String username,
                            String password,
                            Integer isRoot,
                            Collection<? extends GrantedAuthority> authorities) {
        super(username, password == null ? "" : password,
                authorities == null ? java.util.List.of() : authorities);
        this.adminId = adminId;
        this.isRoot = isRoot;
    }
}
