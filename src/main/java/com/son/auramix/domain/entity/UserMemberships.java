package com.son.auramix.domain.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 用户会员订阅实体
 */
@Data
@TableName("user_memberships")
public class UserMemberships {

    @TableId(type = IdType.ASSIGN_ID)
    private Long id;

    private Long userId;

    private Long planId;

    private Long orderId;

    private LocalDateTime startDate;

    private LocalDateTime endDate;

    private Integer status;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}