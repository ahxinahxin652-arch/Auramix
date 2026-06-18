package com.son.auramix.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.son.auramix.domain.entity.Admin;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface AdminMapper extends BaseMapper<Admin> {

    /**
     * 全表计数（等价于 selectCount(null)），仅供启动时检测空表使用。
     */
    default Long selectCount() {
        return selectCount(null);
    }
}
