package com.son.auramix.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.son.auramix.domain.entity.Playlist;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface PlaylistMapper extends BaseMapper<Playlist> {
}
