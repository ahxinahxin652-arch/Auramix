package com.son.auramix.service.user;

import com.son.auramix.common.result.PageResult;
import com.son.auramix.domain.dto.user.PlaybackRecordDTO;
import com.son.auramix.domain.vo.user.PlaybackHistoryVO;

/**
 * 用户播放历史服务
 */
public interface PlaybackHistoryService {

    /** 记录一次播放 */
    PlaybackHistoryVO recordPlayback(PlaybackRecordDTO req);

    /** 分页查询当前用户的播放历史 */
    PageResult<PlaybackHistoryVO> listMyHistory(Integer pageNum, Integer pageSize);

    /** 清空当前用户的播放历史 */
    void clearMyHistory();
}
