package com.son.auramix.domain.dto.ai;

import lombok.Data;
import java.util.List;

@Data
public class AiChatRequest {
    private List<Message> messages;

    @Data
    public static class Message {
        private String role; // "user" or "ai" or "assistant"
        private String content;
    }
}
