package com.son.auramix.service.admin;

import com.son.auramix.common.result.PageResult;
import com.son.auramix.domain.dto.admin.ReviewConfirmDTO;
import com.son.auramix.domain.vo.admin.ReviewDetailVO;
import com.son.auramix.domain.vo.admin.ReviewListItemVO;

public interface ReviewService {

    void triggerReview(Long trackId);

    PageResult<ReviewListItemVO> listPending(Integer pageNum, Integer pageSize);

    /**
     * 分页查询所有审核记录，可选按 status 筛选。
     *
     * @param status 审核状态：0=AI审核中, 1=AI审核完成待自动处理, 2=已自动处理,
     *               3=待人工确认, 4=人工已确认, 5=失败/异常；null 表示不筛选
     */
    PageResult<ReviewListItemVO> listAll(Integer status, Integer pageNum, Integer pageSize);

    /**
     * 查询单条审核记录详情：审核中返回实时进度，完成时返回完整审核报告，
     * 人工已确认时额外返回管理员裁决信息。
     */
    ReviewDetailVO getDetail(Long id);

    void confirmReview(Long recordId, ReviewConfirmDTO dto, Long adminId);
}
