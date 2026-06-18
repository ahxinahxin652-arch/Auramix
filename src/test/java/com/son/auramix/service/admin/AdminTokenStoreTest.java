package com.son.auramix.service.admin;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.SetOperations;
import org.springframework.data.redis.core.ValueOperations;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AdminTokenStoreTest {

    @Mock
    private RedisTemplate<String, Object> redisTemplate;

    @Mock
    private ValueOperations<String, Object> valueOps;

    @Mock
    private SetOperations<String, Object> setOps;

    @InjectMocks
    private AdminTokenStore tokenStore;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(tokenStore, "ttlSeconds", 7200L);
    }

    @Test
    void saveToken_writesForwardKeyWithTtlAndAddsToReverseSet() {
        when(redisTemplate.opsForValue()).thenReturn(valueOps);
        when(redisTemplate.opsForSet()).thenReturn(setOps);

        AdminSessionInfo info = AdminSessionInfo.builder()
                .id(7).username("alice").isRoot(0)
                .loginIp("1.2.3.4").loginTime(LocalDateTime.now())
                .build();

        tokenStore.saveToken("tok-abc", info);

        ArgumentCaptor<Duration> ttlCap = ArgumentCaptor.forClass(Duration.class);
        verify(valueOps).set(eq("admin:token:tok-abc"), eq(info), ttlCap.capture());
        assertThat(ttlCap.getValue()).isEqualTo(Duration.ofSeconds(7200));

        verify(setOps).add("admin:tokens:7", "tok-abc");
    }

    @Test
    void loadToken_returnsNullWhenForwardKeyMissing() {
        when(redisTemplate.opsForValue()).thenReturn(valueOps);
        when(valueOps.get("admin:token:missing")).thenReturn(null);

        AdminSessionInfo result = tokenStore.loadToken("missing");

        assertThat(result).isNull();
        verify(redisTemplate, never()).expire(anyString(), any(Duration.class));
    }

    @Test
    void loadToken_returnsValueAndTouchesTtlWhenPresent() {
        AdminSessionInfo info = AdminSessionInfo.builder().id(7).username("alice").build();
        when(redisTemplate.opsForValue()).thenReturn(valueOps);
        when(valueOps.get("admin:token:t1")).thenReturn(info);

        AdminSessionInfo result = tokenStore.loadToken("t1");

        assertThat(result).isEqualTo(info);
        verify(redisTemplate).expire("admin:token:t1", Duration.ofSeconds(7200));
    }

    @Test
    void revokeAllTokens_deletesAllTokensThenDeletesReverseSet() {
        when(redisTemplate.opsForSet()).thenReturn(setOps);
        when(setOps.members("admin:tokens:7")).thenReturn(Set.<Object>of("t1", "t2", "stale"));

        tokenStore.revokeAllTokens(7);

        verify(redisTemplate).delete("admin:token:t1");
        verify(redisTemplate).delete("admin:token:t2");
        verify(redisTemplate).delete("admin:token:stale");
        verify(redisTemplate).delete("admin:tokens:7");
    }

    @Test
    void revokeToken_deletesForwardAndSrem() {
        when(redisTemplate.opsForSet()).thenReturn(setOps);

        tokenStore.revokeToken(7, "t1");

        verify(redisTemplate).delete("admin:token:t1");
        verify(setOps).remove("admin:tokens:7", "t1");
    }
}
