package com.son.auramix.ai.agent;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Component;

@Component
public class PoliticalSensitivityAgent extends AbstractDimensionAgent {

    public PoliticalSensitivityAgent(@Qualifier("politicalChatClient") ChatClient chatClient) {
        super(chatClient);
    }

    @Override
    public String getName() {
        return "PoliticalSensitivity";
    }
}
