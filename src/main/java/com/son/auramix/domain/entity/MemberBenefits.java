package com.son.auramix.domain.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 会员权益实体
 */
@Data
@TableName("member_benefits")
public class MemberBenefits {

    @TableId(type = IdType.ASSIGN_ID)
    private Long id;

    private Long planId;

    private String benefitKey;

    private String benefitValue;

    private Integer benefitType;

    private Integer status;

    private Integer sortOrder;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}
