package com.son.auramix.domain.dto.admin;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ArtistCreateRequest {
    @NotBlank(message = "Artist name cannot be blank")
    private String name;

    private String coverImg;

    private String bio;
}
