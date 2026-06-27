package com.son.auramix.domain.dto.common;

import lombok.Data;

/**
 * 分页请求参数
 */
@Data
public class PageDTO {

    /** 当前页，默认第 1 页 */
    private Integer page = 1;

    /** 每页条数，默认 10 */
    private Integer pageSize = 10;
}
