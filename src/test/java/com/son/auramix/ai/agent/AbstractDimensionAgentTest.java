package com.son.auramix.ai.agent;

import com.son.auramix.ai.dto.AgentResult;
import com.son.auramix.ai.dto.ReviewContext;
import org.junit.jupiter.api.Test;
import org.springframework.ai.chat.client.ChatClient;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class AbstractDimensionAgentTest {

    static class TestAgent extends AbstractDimensionAgent {
        TestAgent(ChatClient chatClient) { super(chatClient); }
        @Override public String getName() { return "TestAgent"; }
        @Override public String getCriteria() {
            return "1) 测试条目A\n2) 测试条目B";
        }
    }

    private ReviewContext sampleCtx() {
        return ReviewContext.builder()
            .trackId(123L)
            .trackTitle("测试歌")
            .artistNames("测试歌手")
            .albumTitle("测试专辑")
            .lyricsContent("测试歌词")
            .hasLyrics(true)
            .reviewType("TEXT_ONLY")
            .build();
    }

    @Test
    void buildPrompt_containsCriteriaAndContext() {
        ChatClient chatClient = mock(ChatClient.class);
        TestAgent agent = new TestAgent(chatClient);

        String prompt = agent.buildPrompt(sampleCtx());

        assertThat(prompt).contains("歌曲标题: 测试歌");
        assertThat(prompt).contains("歌手: 测试歌手");
        assertThat(prompt).contains("专辑: 测试专辑");
        assertThat(prompt).contains("歌词: 测试歌词");
        assertThat(prompt).contains("1) 测试条目A");
        assertThat(prompt).contains("2) 测试条目B");
        assertThat(prompt).contains("请从以下维度进行判断");
        assertThat(prompt).contains("verdict");
    }

    @Test
    void buildPrompt_handlesNullArtistAndAlbum() {
        ChatClient chatClient = mock(ChatClient.class);
        TestAgent agent = new TestAgent(chatClient);

        ReviewContext ctx = sampleCtx();
        ctx.setArtistNames(null);
        ctx.setAlbumTitle(null);

        String prompt = agent.buildPrompt(ctx);

        assertThat(prompt).contains("歌手: 未知");
        assertThat(prompt).contains("专辑: 未知");
    }

    @Test
    void buildPrompt_withoutLyricsShowsMetaOnly() {
        ChatClient chatClient = mock(ChatClient.class);
        TestAgent agent = new TestAgent(chatClient);

        ReviewContext ctx = sampleCtx();
        ctx.setHasLyrics(false);
        ctx.setLyricsContent(null);

        String prompt = agent.buildPrompt(ctx);

        assertThat(prompt).contains("歌词: 无歌词，仅审核元信息");
    }

    @Test
    void review_parsesValidJsonResponse() {
        ChatClient chatClient = mock(ChatClient.class);
        TestAgent agent = new TestAgent(chatClient);

        ChatClient.RequestSpec requestSpec = mock(ChatClient.RequestSpec.class);
        ChatClient.CallSpec callSpec = mock(ChatClient.CallSpec.class);
        ChatClient.ResponseSpec responseSpec = mock(ChatClient.ResponseSpec.class);
        when(chatClient.prompt()).thenReturn(requestSpec);
        when(requestSpec.user(any(String.class))).thenReturn(callSpec);
        when(callSpec.call()).thenReturn(responseSpec);
        when(responseSpec.content()).thenReturn("{\"verdict\":\"PASS\",\"confidence\":90,\"reason\":null}");

        AgentResult result = agent.review(sampleCtx());

        assertThat(result.getAgentName()).isEqualTo("TestAgent");
        assertThat(result.getVerdict()).isEqualTo("PASS");
        assertThat(result.getConfidence()).isEqualTo(90);
        assertThat(result.getReason()).isNull();
    }

    @Test
    void review_handlesNonJsonResponseAsFail() {
        ChatClient chatClient = mock(ChatClient.class);
        TestAgent agent = new TestAgent(chatClient);

        ChatClient.RequestSpec requestSpec = mock(ChatClient.RequestSpec.class);
        ChatClient.CallSpec callSpec = mock(ChatClient.CallSpec.class);
        ChatClient.ResponseSpec responseSpec = mock(ChatClient.ResponseSpec.class);
        when(chatClient.prompt()).thenReturn(requestSpec);
        when(requestSpec.user(any(String.class))).thenReturn(callSpec);
        when(callSpec.call()).thenReturn(responseSpec);
        when(responseSpec.content()).thenReturn("这不是 JSON");

        AgentResult result = agent.review(sampleCtx());

        assertThat(result.getVerdict()).isEqualTo("FAIL");
        assertThat(result.getConfidence()).isEqualTo(0);
        assertThat(result.getReason()).isEqualTo("agent输出格式异常");
    }

    @Test
    void review_handlesMarkdownWrappedJson() {
        ChatClient chatClient = mock(ChatClient.class);
        TestAgent agent = new TestAgent(chatClient);

        ChatClient.RequestSpec requestSpec = mock(ChatClient.RequestSpec.class);
        ChatClient.CallSpec callSpec = mock(ChatClient.CallSpec.class);
        ChatClient.ResponseSpec responseSpec = mock(ChatClient.ResponseSpec.class);
        when(chatClient.prompt()).thenReturn(requestSpec);
        when(requestSpec.user(any(String.class))).thenReturn(callSpec);
        when(callSpec.call()).thenReturn(responseSpec);
        when(responseSpec.content()).thenReturn("```json\n{\"verdict\":\"FAIL\",\"confidence\":50,\"reason\":\"违规\"}\n```");

        AgentResult result = agent.review(sampleCtx());

        assertThat(result.getVerdict()).isEqualTo("FAIL");
        assertThat(result.getConfidence()).isEqualTo(50);
        assertThat(result.getReason()).isEqualTo("违规");
    }

    @Test
    void review_handlesChatClientException() {
        ChatClient chatClient = mock(ChatClient.class);
        TestAgent agent = new TestAgent(chatClient);

        when(chatClient.prompt()).thenThrow(new RuntimeException("LLM 调用失败"));

        AgentResult result = agent.review(sampleCtx());

        assertThat(result.getVerdict()).isEqualTo("FAIL");
        assertThat(result.getConfidence()).isEqualTo(0);
        assertThat(result.getReason()).contains("agent调用异常");
    }
}
