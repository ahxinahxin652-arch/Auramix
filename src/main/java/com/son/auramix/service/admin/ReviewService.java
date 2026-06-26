package com.son.auramix.service.admin;

import com.son.auramix.common.result.PageResult;
import com.son.auramix.domain.dto.admin.ReviewConfirmDTO;
import com.son.auramix.domain.vo.admin.ReviewListItemVO;

public interface ReviewService {

    void triggerReview(Long trackId);

    PageResult<ReviewListItemVO> listPending(Integer pageNum, Integer pageSize);

    void confirmReview(Long recordId, ReviewConfirmDTO dto, Long adminId);
}
