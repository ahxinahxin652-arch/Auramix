package com.son.auramix.service;

import com.son.auramix.domain.dto.ai.AiChatRequest;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.messages.AssistantMessage;
import org.springframework.ai.chat.messages.Message;
import org.springframework.ai.chat.messages.UserMessage;
import org.springframework.ai.chat.messages.SystemMessage;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;

import java.util.ArrayList;
import java.util.List;

@Service
public class AiChatService {

    private final ChatClient chatClient;

    public AiChatService(ChatClient.Builder chatClientBuilder) {
        this.chatClient = chatClientBuilder.build();
    }

    public Flux<String> streamChat(AiChatRequest request) {
        List<Message> promptMessages = new ArrayList<>();
        
        // You can add a default system message here to give the AI context about Auramix
        promptMessages.add(new SystemMessage("You are a smart AI assistant for Auramix, a music streaming platform. You are helpful, friendly, and knowledgeable about music."));

        for (AiChatRequest.Message msg : request.getMessages()) {
            if ("user".equalsIgnoreCase(msg.getRole())) {
                promptMessages.add(new UserMessage(msg.getContent()));
            } else {
                promptMessages.add(new AssistantMessage(msg.getContent()));
            }
        }

        Prompt prompt = new Prompt(promptMessages);

        return chatClient.prompt(prompt)
                .stream()
                .content();
    }
}
