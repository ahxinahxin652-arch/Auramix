package com.son.auramix.ai.aggregator;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.son.auramix.ai.dto.AgentResult;
import com.son.auramix.ai.dto.AgentResultsPayload;
import com.son.auramix.ai.dto.DimensionSummary;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class AgentResultsFormatterTest {

    private final ObjectMapper objectMapper = new ObjectMapper();
    private final AgentResultsFormatter formatter = new AgentResultsFormatter(objectMapper);

    private String buildAgentResultsJson() throws Exception {
        AgentResultsPayload payload = new AgentResultsPayload();
        payload.setDimensionSummary(List.of(
            new DimensionSummary("PoliticalSensitivity", "PASS", 92),
            new DimensionSummary("ViolenceTerror", "PASS", 88),
            new DimensionSummary("ExplicitContent", "PASS", 85),
            new DimensionSummary("AntiSocial", "FAIL", 45)
        ));
        payload.setDimensions(List.of(
            AgentResult.builder().agentName("PoliticalSensitivity").verdict("PASS").confidence(92).reason(null).build(),
            AgentResult.builder().agentName("ViolenceTerror").verdict("PASS").confidence(88).reason(null).build(),
            AgentResult.builder().agentName("ExplicitContent").verdict("PASS").confidence(85).reason(null).build(),
            AgentResult.builder().agentName("AntiSocial").verdict("FAIL").confidence(45)
                .reason("歌词中含对他人人身攻击的隐喻").build()
        ));
        payload.setJudge(AgentResult.builder().agentName("ReviewJudge").verdict("FAIL").confidence(45)
            .reason("反社会: 歌词中含对他人人身攻击的隐喻 (confidence=45)").build());
        return objectMapper.writeValueAsString(payload);
    }

    @Test
    void formatDimensions_allPassConcatenatesAllFour() throws Exception {
        AgentResultsPayload payload = new AgentResultsPayload();
        payload.setDimensionSummary(List.of(
            new DimensionSummary("PoliticalSensitivity", "PASS", 92),
            new DimensionSummary("ViolenceTerror", "PASS", 88),
            new DimensionSummary("ExplicitContent", "PASS", 85),
            new DimensionSummary("AntiSocial", "PASS", 90)
        ));
        payload.setDimensions(List.of(
            AgentResult.builder().agentName("PoliticalSensitivity").verdict("PASS").confidence(92).reason(null).build(),
            AgentResult.builder().agentName("ViolenceTerror").verdict("PASS").confidence(88).reason(null).build(),
            AgentResult.builder().agentName("ExplicitContent").verdict("PASS").confidence(85).reason(null).build(),
            AgentResult.builder().agentName("AntiSocial").verdict("PASS").confidence(90).reason(null).build()
        ));
        String agentResults = objectMapper.writeValueAsString(payload);

        String result = formatter.formatDimensions(agentResults);

        assertThat(result).isEqualTo(
            "政治敏感审核通过：置信度92；暴力恐怖审核通过：置信度88；色情低俗审核通过：置信度85；反社会审核通过：置信度90"
        );
    }

    @Test
    void formatDimensions_failIncludesReasonInYiShi() throws Exception {
        String agentResults = buildAgentResultsJson();

        String result = formatter.formatDimensions(agentResults);

        assertThat(result).contains("政治敏感审核通过：置信度92");
        assertThat(result).contains("暴力恐怖审核通过：置信度88");
        assertThat(result).contains("反社会审核未通过，疑是：歌词中含对他人人身攻击的隐喻");
        assertThat(result.split("；").length).isEqualTo(4);
    }

    @Test
    void formatDimensions_nullJsonReturnsNull() {
        assertThat(formatter.formatDimensions(null)).isNull();
    }

    @Test
    void formatDimensions_invalidJsonReturnsNull() {
        assertThat(formatter.formatDimensions("not a json{{{")).isNull();
    }

    @Test
    void formatDimensions_unknownAgentNameFallsBackToEnglish() throws Exception {
        AgentResultsPayload payload = new AgentResultsPayload();
        payload.setDimensions(List.of(
            AgentResult.builder().agentName("NewDimension").verdict("PASS").confidence(80).reason(null).build()
        ));
        String json = objectMapper.writeValueAsString(payload);

        String result = formatter.formatDimensions(json);

        assertThat(result).contains("NewDimension审核通过");
    }
}
