package com.son.auramix.domain.dto.admin;

import lombok.Data;

/**
 * 会员用户分页搜索请求参数
 * <p>
 * email 为精确匹配，planLevel 为 AND 关系
 */
@Data
public class MemberSearchDTO {

    /** 用户邮箱（精确匹配，可选） */
    private String email;

    /** 会员等级（可选） */
    private Integer planLevel;

    /** 当前页，默认第 1 页 */
    private Integer page = 1;

    /** 每页条数，默认 10 */
    private Integer pageSize = 10;
}
