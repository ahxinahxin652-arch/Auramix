package com.son.auramix.domain.cache;

import lombok.Data;
import java.io.Serializable;
import java.time.LocalDateTime;

@Data
public class PlaylistTrackRelationDTO implements Serializable {
    private static final long serialVersionUID = 1L;
    
    private Long trackId;
    private Integer sortOrder;
    private LocalDateTime addedAt;
}
