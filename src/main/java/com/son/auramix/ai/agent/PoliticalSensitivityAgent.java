package com.son.auramix.ai.agent;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

@Component
@Order(10)
public class PoliticalSensitivityAgent extends AbstractDimensionAgent implements DimensionAgent {

    public PoliticalSensitivityAgent(@Qualifier("politicalChatClient") ChatClient chatClient) {
        super(chatClient);
    }

    @Override
    public String getName() {
        return "PoliticalSensitivity";
    }

    @Override
    public String getCriteria() {
        return "1) 反国家、颠覆国家政权言论\n" +
               "2) 领土主权不当表述\n" +
               "3) 政治领导人侮辱性言论\n" +
               "4) 政治敏感事件不当评论";
    }
}
