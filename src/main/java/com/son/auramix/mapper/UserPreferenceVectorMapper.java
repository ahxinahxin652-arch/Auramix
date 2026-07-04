package com.son.auramix.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.son.auramix.domain.entity.UserPreferenceVector;
import org.apache.ibatis.annotations.Mapper;

/**
 * 用户偏好向量 Mapper
 *
 * @author auramix
 */
@Mapper
public interface UserPreferenceVectorMapper extends BaseMapper<UserPreferenceVector> {
}
