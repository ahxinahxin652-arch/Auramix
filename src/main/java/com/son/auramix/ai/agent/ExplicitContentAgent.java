package com.son.auramix.ai.agent;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

@Component
@Order(30)
public class ExplicitContentAgent extends AbstractDimensionAgent implements DimensionAgent {

    public ExplicitContentAgent(@Qualifier("explicitChatClient") ChatClient chatClient) {
        super(chatClient);
    }

    @Override
    public String getName() {
        return "ExplicitContent";
    }

    @Override
    public String getCriteria() {
        return "1) 色情、低俗内容\n" +
               "2) 侮辱性语言\n" +
               "3) 不良价值观引导\n" +
               "4) 庸俗化表达";
    }
}
