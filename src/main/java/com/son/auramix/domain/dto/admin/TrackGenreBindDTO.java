package com.son.auramix.domain.dto.admin;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;

@Data
public class TrackGenreBindDTO {
    @NotNull(message = "歌曲ID不能为空")
    private Long trackId;
    
    @NotEmpty(message = "流派ID列表不能为空")
    private List<Long> genreIds;
}
