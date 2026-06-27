package com.son.auramix.domain.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 会员方案实体
 */
@Data
@TableName("membership_plans")
public class MembershipPlans {

    @TableId(type = IdType.ASSIGN_ID) // 雪花算法
    private Long id;

    private String name;

    private String description;

    private Integer durationMonths;

    private BigDecimal price;

    private BigDecimal originalPrice;

    private Integer level;

    private Integer status;

    private Integer sortOrder;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}
