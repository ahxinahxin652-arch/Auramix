package com.son.auramix.domain.vo.admin;

import lombok.Data;

@Data
public class AlbumSearchVO {
    private Long id;
    private String title;
    private Integer albumType;
    private String coverUrl;
}
