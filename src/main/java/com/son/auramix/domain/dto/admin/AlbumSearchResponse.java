package com.son.auramix.domain.dto.admin;

import lombok.Data;

@Data
public class AlbumSearchResponse {
    private String id;
    private String title;
    private Integer albumType;
    private String coverUrl;
}
