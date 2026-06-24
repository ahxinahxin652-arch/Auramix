package com.son.auramix.domain.dto.admin;

import lombok.Data;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

@Data
public class AlbumQuickCreateRequest {
    @NotBlank(message = "Album title cannot be blank")
    private String title;
    @NotNull(message = "Album type is required")
    private Integer albumType;
    private String coverUrl;
    private String releaseDate; // YYYY-MM-DD
}
