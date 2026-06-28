package com.son.auramix.ai.agent;

import com.son.auramix.ai.dto.AgentResult;
import com.son.auramix.ai.dto.ReviewContext;
import org.junit.jupiter.api.Test;
import org.springframework.core.annotation.Order;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class ReviewAgentSorterTest {

    @Order(30)
    static class AgentC implements DimensionAgent {
        @Override public String getName() { return "C"; }
        @Override public boolean supports(String reviewType) { return true; }
        @Override public AgentResult review(ReviewContext ctx) { return null; }
        @Override public String getCriteria() { return ""; }
    }

    @Order(10)
    static class AgentA implements DimensionAgent {
        @Override public String getName() { return "A"; }
        @Override public boolean supports(String reviewType) { return true; }
        @Override public AgentResult review(ReviewContext ctx) { return null; }
        @Override public String getCriteria() { return ""; }
    }

    @Order(20)
    static class AgentB implements DimensionAgent {
        @Override public String getName() { return "B"; }
        @Override public boolean supports(String reviewType) { return true; }
        @Override public AgentResult review(ReviewContext ctx) { return null; }
        @Override public String getCriteria() { return ""; }
    }

    @Test
    void sortByOrder_ascendingByAnnotationValue() {
        List<DimensionAgent> input = List.of(new AgentC(), new AgentA(), new AgentB());

        List<DimensionAgent> sorted = ReviewAgentSorter.sortByOrder(input);

        assertThat(sorted).extracting(DimensionAgent::getName)
            .containsExactly("A", "B", "C");
    }

    @Test
    void sortByOrder_preservesRelativeOrderForSameOrderValue() {
        @Order(10)
        class AgentD implements DimensionAgent {
            @Override public String getName() { return "D"; }
            @Override public boolean supports(String reviewType) { return true; }
            @Override public AgentResult review(ReviewContext ctx) { return null; }
            @Override public String getCriteria() { return ""; }
        }
        List<DimensionAgent> input = List.of(new AgentC(), new AgentA(), new AgentD(), new AgentB());

        List<DimensionAgent> sorted = ReviewAgentSorter.sortByOrder(input);

        // A 和 D 都是 @Order(10)，输入顺序为 A → D
        assertThat(sorted).extracting(DimensionAgent::getName)
            .containsExactly("A", "D", "B", "C");
    }
}
