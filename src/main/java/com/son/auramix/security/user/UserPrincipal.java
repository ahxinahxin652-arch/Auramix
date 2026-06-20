package com.son.auramix.security.user;

import lombok.Getter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.User;

import java.util.Collection;

/**
 * Spring Security 的 {@link User} 扩展，携带用户 ID。
 */
@Getter
public class UserPrincipal extends User {

    /** 用户主键 ID */
    private final Long userId;

    public UserPrincipal(Long userId,
                         String email,
                         String password,
                         Collection<? extends GrantedAuthority> authorities) {
        super(email, password == null ? "" : password,
                authorities == null ? java.util.List.of() : authorities);
        this.userId = userId;
    }
}
