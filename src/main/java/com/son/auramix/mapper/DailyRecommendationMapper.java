package com.son.auramix.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.son.auramix.domain.entity.DailyRecommendation;
import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

/**
 * 每日推荐记录 Mapper
 *
 * @author auramix
 */
@Mapper
public interface DailyRecommendationMapper extends BaseMapper<DailyRecommendation> {

    /**
     * 批量插入每日推荐记录
     */
    @Insert("<script>" +
            "INSERT INTO daily_recommendations (user_id, track_id, recommend_date, `rank`, reason_tag, `source`) VALUES " +
            "<foreach collection='list' item='item' separator=','>" +
            "(#{item.userId}, #{item.trackId}, #{item.recommendDate}, #{item.rank}, #{item.reasonTag}, #{item.source})" +
            "</foreach>" +
            "</script>")
    int batchInsert(@Param("list") List<DailyRecommendation> list);
}
