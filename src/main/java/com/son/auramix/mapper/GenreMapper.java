package com.son.auramix.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.son.auramix.entity.Genre;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface GenreMapper extends BaseMapper<Genre> {
}
