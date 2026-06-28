package com.son.auramix.ai.agent;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

@Component
@Order(20)
public class ViolenceTerrorAgent extends AbstractDimensionAgent implements DimensionAgent {

    public ViolenceTerrorAgent(@Qualifier("violenceChatClient") ChatClient chatClient) {
        super(chatClient);
    }

    @Override
    public String getName() {
        return "ViolenceTerror";
    }

    @Override
    public String getCriteria() {
        return "1) 宣扬暴力、恐怖主义\n" +
               "2) 极端行为、血腥描写\n" +
               "3) 煽动暴力冲突\n" +
               "4) 恐怖组织相关内容";
    }
}
