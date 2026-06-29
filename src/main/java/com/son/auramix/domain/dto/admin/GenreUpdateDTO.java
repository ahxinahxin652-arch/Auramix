package com.son.auramix.domain.dto.admin;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class GenreUpdateDTO {
    @NotBlank(message = "流派名称不能为空")
    private String name;
}
