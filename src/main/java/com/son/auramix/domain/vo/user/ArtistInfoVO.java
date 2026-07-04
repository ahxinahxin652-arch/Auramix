package com.son.auramix.domain.vo.user;

import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.fasterxml.jackson.databind.ser.std.ToStringSerializer;
import lombok.Data;

/**
 * 歌曲的歌手信息，包含角色信息
 */
@Data
public class ArtistInfoVO {
    @JsonSerialize(using = ToStringSerializer.class)
    private Long id;
    private String name;
    /** 0=Main 1=Featuring 2=Composer */
    private Integer role;
}
