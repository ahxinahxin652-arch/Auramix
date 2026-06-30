package com.son.auramix.ai.agent;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * 验证 4 个维度 Agent：
 * 1) getName() 返回期望的英文标识
 * 2) getCriteria() 返回非空且条目化文本
 * 3) getCriteria() 内容不重复
 * 4) implements DimensionAgent（编译期保证）
 */
class PoliticalSensitivityAgentTest {

    /** 直接 new，不依赖 Spring 容器（criteria 是常量，与 ChatClient 无关） */
    @Test
    void criteria_containsExpectedEntries() {
        // 构造时不调 ChatClient.prompt()，因为 criteria 是静态字符串
        PoliticalSensitivityAgent agent = new PoliticalSensitivityAgent(null);
        String criteria = agent.getCriteria();

        assertThat(criteria).isNotBlank();
        assertThat(criteria).contains("反国家");
        assertThat(criteria).contains("颠覆");
        assertThat(criteria).contains("领土主权");
        assertThat(criteria).contains("政治领导人");
        assertThat(criteria).contains("政治敏感事件");
    }

    @Test
    void getName_isPoliticalSensitivity() {
        PoliticalSensitivityAgent agent = new PoliticalSensitivityAgent(null);
        assertThat(agent.getName()).isEqualTo("PoliticalSensitivity");
    }

    @Test
    void violenceTerror_criteriaContainsExpectedEntries() {
        ViolenceTerrorAgent agent = new ViolenceTerrorAgent(null);
        String criteria = agent.getCriteria();

        assertThat(criteria).isNotBlank();
        assertThat(criteria).contains("暴力");
        assertThat(criteria).contains("恐怖主义");
        assertThat(criteria).contains("血腥");
        assertThat(criteria).contains("恐怖组织");
    }

    @Test
    void explicitContent_criteriaContainsExpectedEntries() {
        ExplicitContentAgent agent = new ExplicitContentAgent(null);
        String criteria = agent.getCriteria();

        assertThat(criteria).isNotBlank();
        assertThat(criteria).contains("色情");
        assertThat(criteria).contains("低俗");
        assertThat(criteria).contains("侮辱");
        assertThat(criteria).contains("价值观");
    }

    @Test
    void antiSocial_criteriaContainsExpectedEntries() {
        AntiSocialAgent agent = new AntiSocialAgent(null);
        String criteria = agent.getCriteria();

        assertThat(criteria).isNotBlank();
        assertThat(criteria).contains("反社会");
        assertThat(criteria).contains("仇恨");
        assertThat(criteria).contains("歧视");
        assertThat(criteria).contains("核心价值观");
    }

    @Test
    void allFourCriteria_areUnique() {
        PoliticalSensitivityAgent p = new PoliticalSensitivityAgent(null);
        ViolenceTerrorAgent v = new ViolenceTerrorAgent(null);
        ExplicitContentAgent e = new ExplicitContentAgent(null);
        AntiSocialAgent a = new AntiSocialAgent(null);

        // 4 维度 criteria 应互不相同（防 copy-paste 错误）
        assertThat(p.getCriteria()).isNotEqualTo(v.getCriteria());
        assertThat(v.getCriteria()).isNotEqualTo(e.getCriteria());
        assertThat(e.getCriteria()).isNotEqualTo(a.getCriteria());
        assertThat(p.getCriteria()).isNotEqualTo(e.getCriteria());
    }
}
