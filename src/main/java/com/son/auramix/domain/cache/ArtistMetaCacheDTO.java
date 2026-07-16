package com.son.auramix.domain.cache;

import lombok.Data;

import java.io.Serial;
import java.io.Serializable;

@Data
public class ArtistMetaCacheDTO implements Serializable {
    @Serial
    private static final long serialVersionUID = 1L;

    private String name;
}
