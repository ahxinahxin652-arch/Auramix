package com.son.auramix.service.user.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.son.auramix.common.result.PageResult;
import com.son.auramix.domain.dto.user.PlaybackRecordDTO;
import com.son.auramix.domain.entity.PlaybackHistory;
import com.son.auramix.domain.vo.user.PlaybackHistoryVO;
import com.son.auramix.mapper.PlaybackHistoryMapper;
import com.son.auramix.security.user.UserPrincipal;
import com.son.auramix.service.user.PlaybackHistoryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * 用户播放历史服务实现
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class PlaybackHistoryServiceImpl implements PlaybackHistoryService {

    private final PlaybackHistoryMapper playbackHistoryMapper;

    /**
     * 从 SecurityContextHolder 获取当前登录用户 ID
     */
    private Long getCurrentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof UserPrincipal principal) {
            return principal.getUserId();
        }
        throw new RuntimeException("用户未登录");
    }

    @Override
    @Transactional
    public PlaybackHistoryVO recordPlayback(PlaybackRecordDTO req) {
        Long userId = getCurrentUserId();

        PlaybackHistory history = new PlaybackHistory();
        history.setUserId(userId);
        history.setTrackId(req.getTrackId());
        history.setContextType(req.getContextType());
        history.setContextId(req.getContextId());

        playbackHistoryMapper.insert(history);

        log.info("[PlaybackHistory] 记录播放 userId={}, trackId={}, id={}", userId, req.getTrackId(), history.getId());

        return toVO(history);
    }

    @Override
    public PageResult<PlaybackHistoryVO> listMyHistory(Integer pageNum, Integer pageSize) {
        Long userId = getCurrentUserId();
        int current = pageNum == null || pageNum < 1 ? 1 : pageNum;
        int size = pageSize == null || pageSize < 1 ? 10 : (Math.min(pageSize, 100));

        Page<PlaybackHistory> page = playbackHistoryMapper.selectPage(
                new Page<>(current, size),
                new LambdaQueryWrapper<PlaybackHistory>()
                        .eq(PlaybackHistory::getUserId, userId)
                        .orderByDesc(PlaybackHistory::getPlayedAt)
        );

        List<PlaybackHistoryVO> records = page.getRecords().stream()
                .map(this::toVO)
                .collect(Collectors.toList());

        return new PageResult<>(page.getCurrent(), page.getSize(), page.getTotal(), page.getPages(), records);
    }

    @Override
    @Transactional
    public void clearMyHistory() {
        Long userId = getCurrentUserId();
        int deleted = playbackHistoryMapper.delete(
                new LambdaQueryWrapper<PlaybackHistory>()
                        .eq(PlaybackHistory::getUserId, userId)
        );
        log.info("[PlaybackHistory] 清空播放历史 userId={}, deleted={}", userId, deleted);
    }

    // ============================ 实体转 VO ============================

    private PlaybackHistoryVO toVO(PlaybackHistory entity) {
        PlaybackHistoryVO vo = new PlaybackHistoryVO();
        vo.setId(entity.getId());
        vo.setUserId(entity.getUserId());
        vo.setTrackId(entity.getTrackId());
        vo.setPlayedAt(entity.getPlayedAt());
        vo.setContextType(entity.getContextType());
        vo.setContextId(entity.getContextId());
        return vo;
    }
}
