package com.son.auramix.domain.dto.admin;

import lombok.Data;

/**
 * 支付订单分页搜索请求参数
 * <p>
 * email 为精确匹配用户后筛选订单，payType 和 status 为 AND 关系
 */
@Data
public class PaymentOrderSearchDTO {

    /** 用户邮箱（精确匹配，可选） */
    private String email;

    /** 支付方式（可选） */
    private Integer payType;

    /** 订单状态（可选） */
    private Integer status;

    /** 当前页，默认第 1 页 */
    private Integer page = 1;

    /** 每页条数，默认 10 */
    private Integer pageSize = 10;
}
