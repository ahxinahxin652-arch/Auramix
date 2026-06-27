package com.son.auramix.event;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

/**
 * 歌曲（已提交事务后）创建事件，用于触发 AI 审核等后置异步处理。
 */
@Getter
@RequiredArgsConstructor
public class TrackCreatedEvent {

    private final Long trackId;
}
