package com.son.auramix.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.son.auramix.domain.entity.CfSimilarityTopn;
import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

/**
 * 协同过滤相似度 Mapper
 *
 * @author auramix
 */
@Mapper
public interface CfSimilarityTopnMapper extends BaseMapper<CfSimilarityTopn> {

    /**
     * 批量插入相似度记录
     */
    @Insert("<script>" +
            "INSERT INTO cf_similarity_topn (source_track_id, target_track_id, sim_cf, `rank`) VALUES " +
            "<foreach collection='list' item='item' separator=','>" +
            "(#{item.sourceTrackId}, #{item.targetTrackId}, #{item.simCf}, #{item.similarityRank})" +
            "</foreach>" +
            "</script>")
    int batchInsert(@Param("list") List<CfSimilarityTopn> list);
}
