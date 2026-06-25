package com.son.auramix.domain.dto.admin;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.Data;
import java.util.List;

@Data
public class AlbumUpdateRequest {
    @NotBlank(message = "Album title cannot be blank")
    private String title;

    @NotNull(message = "Album type is required")
    @Min(0)
    @Max(2)
    private Integer albumType;

    private String coverUrl;

    @NotBlank(message = "Release date is required")
    @Pattern(regexp = "^\\d{4}-\\d{2}-\\d{2}$", message = "Release date must be in YYYY-MM-DD format")
    private String releaseDate;

    /** 关联的歌手 ID 列表（全量替换） */
    private List<Long> artistIds;
}
