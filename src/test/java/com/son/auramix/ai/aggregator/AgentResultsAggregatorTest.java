package com.son.auramix.ai.aggregator;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.son.auramix.ai.dto.AgentResult;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class AgentResultsAggregatorTest {

    private final ObjectMapper objectMapper = new ObjectMapper();
    private final AgentResultsAggregator aggregator = new AgentResultsAggregator(objectMapper);

    @Test
    void build_includesDimensionSummaryDimensionsAndJudge() throws Exception {
        // given
        List<AgentResult> dims = List.of(
            AgentResult.builder().agentName("PoliticalSensitivity").verdict("PASS").confidence(92).reason(null).build(),
            AgentResult.builder().agentName("ViolenceTerror").verdict("PASS").confidence(88).reason(null).build(),
            AgentResult.builder().agentName("ExplicitContent").verdict("FAIL").confidence(45).reason("歌词中含粗俗表达").build(),
            AgentResult.builder().agentName("AntiSocial").verdict("PASS").confidence(85).reason(null).build()
        );
        AgentResult judge = AgentResult.builder()
            .agentName("ReviewJudge").verdict("FAIL").confidence(45)
            .reason("色情低俗: 歌词中含粗俗表达 (confidence=45)").build();

        // when
        String json = aggregator.build(dims, judge);
        JsonNode root = objectMapper.readTree(json);

        // then
        assertThat(root.has("dimensionSummary")).isTrue();
        assertThat(root.has("dimensions")).isTrue();
        assertThat(root.has("judge")).isTrue();

        // dimensionSummary 含 4 个元素，每元素仅 3 个字段
        JsonNode summary = root.get("dimensionSummary");
        assertThat(summary.isArray()).isTrue();
        assertThat(summary.size()).isEqualTo(4);
        assertThat(summary.get(2).get("agentName").asText()).isEqualTo("ExplicitContent");
        assertThat(summary.get(2).get("verdict").asText()).isEqualTo("FAIL");
        assertThat(summary.get(2).get("confidence").asInt()).isEqualTo(45);
        // 不含 reason 字段
        assertThat(summary.get(2).has("reason")).isFalse();

        // dimensions 含 4 个元素，含 reason
        JsonNode dimensions = root.get("dimensions");
        assertThat(dimensions.size()).isEqualTo(4);
        assertThat(dimensions.get(2).get("reason").asText()).isEqualTo("歌词中含粗俗表达");
    }

    @Test
    void build_emptyDimensionsProducesEmptySummary() throws Exception {
        // given
        List<AgentResult> dims = List.of();
        AgentResult judge = AgentResult.builder()
            .agentName("ReviewJudge").verdict("FAIL").confidence(0)
            .reason("全部维度异常").build();

        // when
        String json = aggregator.build(dims, judge);
        JsonNode root = objectMapper.readTree(json);

        // then
        assertThat(root.get("dimensionSummary").isArray()).isTrue();
        assertThat(root.get("dimensionSummary").size()).isEqualTo(0);
    }

    @Test
    void build_specialCharsInReasonAreEscaped() throws Exception {
        // given
        List<AgentResult> dims = List.of(
            AgentResult.builder().agentName("X").verdict("FAIL").confidence(0)
                .reason("包含\"双引号\"和\\反斜杠\n换行").build()
        );
        AgentResult judge = AgentResult.builder()
            .agentName("ReviewJudge").verdict("FAIL").confidence(0).reason("异常").build();

        // when
        String json = aggregator.build(dims, judge);

        // then: JSON 解析后 reason 完整还原
        JsonNode root = objectMapper.readTree(json);
        assertThat(root.get("dimensions").get(0).get("reason").asText())
            .isEqualTo("包含\"双引号\"和\\反斜杠\n换行");
    }
}
