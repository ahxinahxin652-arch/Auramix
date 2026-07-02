package com.son.auramix.domain.vo.user;

import lombok.Data;

import java.util.List;

/**
 * 推荐歌曲 VO（含基本播放信息 + 推荐分数/来源）
 *
 * @author auramix
 */
@Data
public class RecommendTrackVO {
    private Long trackId;
    private String title;
    private String albumTitle;
    private String coverUrl;
    private Integer duration;
    private List<ArtistInfoVO> artists;
    private String audioUrl;
    /** 0=非会员可听 1=仅会员可听 */
    private Integer member;
    private Double score;
    private List<String> sources;
}
