package com.son.auramix.domain.vo.admin;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class GenreVO {
    private Long id;
    private String name;
    private LocalDateTime createdAt;
}
