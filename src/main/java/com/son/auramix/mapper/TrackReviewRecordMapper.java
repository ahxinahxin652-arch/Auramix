package com.son.auramix.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.son.auramix.domain.entity.TrackReviewRecord;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Update;

@Mapper
public interface TrackReviewRecordMapper extends BaseMapper<TrackReviewRecord> {

    /**
     * 字段级原子更新 progress_json：用 JSON_SET 局部修改，避免并发 read-modify-write 丢失更新。
     * 调用方传 JSON_SET 的 key-value 对（可变参数），底层拼接为单条 UPDATE。
     *
     * @param id     记录 ID
     * @param sets   形如 "$.dimensions[0].status", "DONE" 的交替参数列表
     * @return 受影响行数
     */
    @Update("<script>" +
            "UPDATE track_review_records SET progress_json = JSON_SET(progress_json, " +
            "<foreach collection='sets' item='kv' separator=','>" +
              "<choose>" +
                "<when test='kv.type == \"int\"'>#{kv.key}, CAST(#{kv.value} AS UNSIGNED)</when>" +
                "<when test='kv.type == \"null\"'>#{kv.key}, NULL</when>" +
                "<otherwise>#{kv.key}, #{kv.value}</otherwise>" +
              "</choose>" +
            "</foreach>) WHERE id = #{id}" +
            "</script>")
    int updateProgressJsonFields(@Param("id") Long id, @Param("sets") java.util.List<JsonSetPair> sets);

    /**
     * completedDimensions 原子递增：用 JSON_EXTRACT 读取当前值 + 1，再 JSON_SET 写回，
     * 单条 SQL 保证原子性，避免并发覆盖。
     *
     * @param id    记录 ID
     * @param delta 递增量（通常为 1）
     * @return 受影响行数
     */
    @Update("UPDATE track_review_records SET progress_json = JSON_SET(" +
            "progress_json, '$.completedDimensions', " +
            "COALESCE(CAST(JSON_EXTRACT(progress_json, '$.completedDimensions') AS UNSIGNED), 0) + #{delta}) " +
            "WHERE id = #{id}")
    int incrementCompletedDimensions(@Param("id") Long id, @Param("delta") int delta);

    /** JSON_SET 中的一个 key-value 对 */
    @lombok.Data
    @lombok.AllArgsConstructor
    class JsonSetPair {
        /** JSON 路径，如 "$.dimensions[0].status" */
        private String key;
        /** 值（String 类型） */
        private String value;
        /** 值类型: "string" / "int" / "null" */
        private String type;
    }
}
