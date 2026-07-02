package com.son.auramix.service;

import com.son.auramix.domain.dto.ai.AiChatRequest;
import com.son.auramix.security.user.UserPrincipal;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.messages.AssistantMessage;
import org.springframework.ai.chat.messages.Message;
import org.springframework.ai.chat.messages.UserMessage;
import org.springframework.ai.chat.messages.SystemMessage;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
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

    static {
        reactor.core.publisher.Hooks.enableAutomaticContextPropagation();
        io.micrometer.context.ContextRegistry.getInstance().registerThreadLocalAccessor(new com.son.auramix.ai.tool.ToolEventSinkAccessor());
    }

    public Flux<String> streamChat(AiChatRequest request) {
        Long currentUserId = null;
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof UserPrincipal up) {
            currentUserId = up.getUserId();
        }

        List<Message> promptMessages = new ArrayList<>();
        
        String systemText = "You are a smart AI assistant for Auramix, a music streaming platform. " +
                "You are helpful, friendly, and knowledgeable about music.\n" +
                "IMPORTANT RULES:\n" +
                "1. When you need to call a tool, call it DIRECTLY. Do NOT output any conversational text or action indicators before the tool call. Just emit the tool call.\n" +
                "2. When recommending songs, output them strictly in this format: [Song: id=xxx, title=Song Name, artists=Artist Name, cover=Cover URL]. Provide actual data returned from tools. You MUST copy the exact cover URL from the tool output. Do NOT make up or shorten the cover URL.\n" +
                "3. When creating a playlist and recommending it, output it strictly in this format: [Playlist: id=50, name=今日推荐歌单]\n" +
                "4. When the user explicitly states their preferences or favorite genres/artists, you MUST call `updateUserProfileTool` to save this information. Do NOT call `getRecentPlaybackAndGenresTool` unless the user explicitly asks for song recommendations.\n";

        promptMessages.add(new SystemMessage(systemText));

        for (AiChatRequest.Message msg : request.getMessages()) {
            if ("user".equalsIgnoreCase(msg.getRole())) {
                promptMessages.add(new UserMessage(msg.getContent()));
            } else {
                promptMessages.add(new AssistantMessage(msg.getContent()));
            }
        }

        reactor.core.publisher.Sinks.Many<String> toolEvents = reactor.core.publisher.Sinks.many().unicast().onBackpressureBuffer();

        Flux<String> llmStream = chatClient.prompt()
                .messages(promptMessages)
                .toolNames("updateUserProfileTool", "readUserProfileTool", "searchSongsByGenreTool", "getRecentPlaybackAndGenresTool", "createPlaylistAndAddSongsTool")
                .stream().content()
                .contextWrite(org.springframework.security.core.context.ReactiveSecurityContextHolder.withAuthentication(auth))
                .onErrorResume(e -> {
                    if (e instanceof java.util.concurrent.TimeoutException) {
                        return reactor.core.publisher.Flux.just("\n[请求超时，请重试]");
                    }
                    return reactor.core.publisher.Flux.just("\n[系统异常: " + e.getMessage() + "]");
                })
                .doFinally(sig -> toolEvents.tryEmitComplete());

        return reactor.core.publisher.Flux.merge(toolEvents.asFlux(), llmStream)
                .contextWrite(ctx -> ctx.put(com.son.auramix.ai.tool.ToolEventSinkAccessor.KEY, toolEvents));
    }
}
