package com.son.auramix.domain.vo.common;

import lombok.Data;

import java.io.Serial;
import java.io.Serializable;
import java.util.Collections;
import java.util.List;

/**
 * 分页结果包装
 *
 * @param <T> 数据项类型
 */
@Data
public class PageResult<T> implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    /** 总记录数 */
    private Long total;

    /** 总页数 */
    private Long pages;

    /** 当前页码 */
    private Long current;

    /** 每页条数 */
    private Long size;

    /** 当前页数据 */
    private List<T> records;

    // ============================ 静态构造 ============================

    public static <T> PageResult<T> of(long total, long current, long size, List<T> records) {
        PageResult<T> result = new PageResult<>();
        result.setTotal(total);
        result.setCurrent(current);
        result.setSize(size);
        result.setPages(total == 0 ? 0 : (total + size - 1) / size);
        result.setRecords(records != null ? records : Collections.emptyList());
        return result;
    }

    public static <T> PageResult<T> empty() {
        return of(0, 1, 10, Collections.emptyList());
    }
}
