package com.son.auramix.ai.report;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * 周期报告专用 ChatClient (复用 Spring AI Alibaba DashScope 启动器, 但用专属 system prompt).
 * <p>
 * 原本方案要求独立 DeepSeek HTTP 客户端, 经评估后改为复用现有 ChatClient
 * (底层模型可在 application.yaml 中切换为 deepseek-chat).
 */
@Configuration
public class ReportChatConfig {

    public static final String REPORT_CHAT_CLIENT = "reportChatClient";

    @Bean(REPORT_CHAT_CLIENT)
    public ChatClient reportChatClient(ChatClient.Builder builder) {
        return builder
                .defaultSystem("你是 Auramix 音乐平台的资深音乐评论家，擅长根据用户听歌数据生成个性化报告。\n" +
                        "你的语言风格：温暖、积极、有共鸣、可以引用具体的歌曲和歌手名。\n" +
                        "输出必须是 JSON 格式，不要任何额外文字或 markdown 标记。\n\n" +
                        "JSON 结构：\n" +
                        "{\n" +
                        "  \"summary\": \"100~200 字的总结，温暖有共鸣\",\n" +
                        "  \"moodTags\": [\"心情标签1\", \"心情标签2\", \"心情标签3\"],\n" +
                        "  \"highlights\": [\"本周/月的高光时刻 1\", \"高光时刻 2\", \"高光时刻 3\"],\n" +
                        "  \"recommendations\": [\"推荐收听 1\", \"推荐收听 2\", \"推荐收听 3\"]\n" +
                        "}")
                .build();
    }
}