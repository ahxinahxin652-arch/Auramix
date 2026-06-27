package com.son.auramix.domain.vo.user;

import lombok.Data;
import java.util.List;

@Data
public class UserPlaylistSyncVO {
    private Long id;
    private String name;
    private String coverUrl;
    private List<Long> trackIds;
}
