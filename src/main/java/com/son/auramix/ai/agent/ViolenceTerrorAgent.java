package com.son.auramix.ai.agent;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Component;

@Component
public class ViolenceTerrorAgent extends AbstractDimensionAgent {

    public ViolenceTerrorAgent(@Qualifier("violenceChatClient") ChatClient chatClient) {
        super(chatClient);
    }

    @Override
    public String getName() {
        return "ViolenceTerror";
    }
}
