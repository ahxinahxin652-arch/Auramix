package com.son.auramix.domain.vo.admin;

import com.son.auramix.ai.dto.AgentResultsPayload;
import com.son.auramix.ai.progress.ReviewProgressVO;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 审核记录详情：根据审核状态返回不同内容段。
 * <ul>
 *   <li>审核中 (status=0)：仅 {@link #progress} 有值，含各维度实时进度 + 已完成维度结果</li>
 *   <li>非审核中：仅 {@link #report} 有值，含完整维度报告 + 裁决结果</li>
 *   <li>人工已确认 (status=4)：{@link #report} + {@link #adminConfirm} 同时有值</li>
 * </ul>
 * 配合 @JsonInclude(NON_NULL)，前端按字段存在性判断渲染。
 */
@Data
public class ReviewDetailVO {

    // ---------- 基础信息（始终返回） ----------
    private Long id;
    private Long trackId;
    private String trackTitle;
    private String artistNames;
    private String albumTitle;
    /** 处理状态: 0=AI审核中, 1=AI审核完成待自动处理, 2=已自动处理, 3=待人工确认, 4=人工已确认, 5=失败/异常 */
    private Integer status;
    /** AI 裁决: 0=待审核, 1=通过, -1=不通过, -2=待人工确认 */
    private Integer verdict;
    /** 最终置信度 0-100 */
    private Integer confidence;
    private String failReasons;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // ---------- 审核中 (status=0) 的实时进度 ----------
    private ReviewProgressVO progress;

    // ---------- 完成后的完整审核报告 ----------
    private AgentResultsPayload report;

    // ---------- 人工已确认 (status=4) 的管理员裁决信息 ----------
    private AdminConfirmInfo adminConfirm;

    @Data
    public static class AdminConfirmInfo {
        private Long adminId;
        /** 管理员裁决: 1=通过, -1=不通过 */
        private Integer adminVerdict;
        private String adminNote;
        private LocalDateTime reviewedAt;
    }
}
