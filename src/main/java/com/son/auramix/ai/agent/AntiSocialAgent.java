package com.son.auramix.ai.agent;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

@Component
@Order(40)
public class AntiSocialAgent extends AbstractDimensionAgent implements DimensionAgent {

    public AntiSocialAgent(@Qualifier("antiSocialChatClient") ChatClient chatClient) {
        super(chatClient);
    }

    @Override
    public String getName() {
        return "AntiSocial";
    }

    @Override
    public String getCriteria() {
        return "1) 反社会、反人类言论\n" +
               "2) 煽动仇恨、歧视\n" +
               "3) 非主流思想、极端思想传播\n" +
               "4) 违背社会核心价值观";
    }
}
