package com.son.auramix.domain.dto.admin;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UserCreateRequest {

    @NotBlank(message = "邮箱不能为空")
    @Email(message = "邮箱格式不合法")
    private String email;

    @NotBlank(message = "密码不能为空")
    @Size(min = 8, max = 64, message = "密码长度需在 8-64 之间")
    private String password;

    @NotBlank(message = "昵称不能为空")
    @Size(min = 1, max = 100, message = "昵称长度需在 1-100 之间")
    private String displayName;

    private String country = "CN";
}
