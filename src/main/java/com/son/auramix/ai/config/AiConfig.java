package com.son.auramix.ai.config;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * 5 个 ChatClient bean，每个 agent 一个独立 ChatClient，独立 system prompt + temperature
 */
@Configuration
public class AiConfig {

    // ============================ 维度审核 agent (temperature=0.3) ============================

    @Bean("politicalChatClient")
    public ChatClient politicalChatClient(ChatClient.Builder builder) {
        return builder
                .defaultSystem("你是音乐内容政治敏感审核专家。你负责审核音乐内容的政治敏感维度：\n" +
                        "- 反国家、颠覆国家政权言论\n" +
                        "- 领土主权不当表述\n" +
                        "- 政治领导人侮辱性言论\n" +
                        "- 政治敏感事件不当评论\n\n" +
                        "请严格审核，以JSON输出：{\"verdict\":\"PASS|FAIL\",\"confidence\":0-100,\"reason\":\"...\"}\n" +
                        "verdict为PASS时reason可为null。confidence为你的置信度(0-100整数)。")
                .build();
    }

    @Bean("violenceChatClient")
    public ChatClient violenceChatClient(ChatClient.Builder builder) {
        return builder
                .defaultSystem("你是音乐内容暴力恐怖审核专家。你负责审核音乐内容的暴力恐怖维度：\n" +
                        "- 宣扬暴力、恐怖主义\n" +
                        "- 极端行为、血腥描写\n" +
                        "- 煽动暴力冲突\n" +
                        "- 恐怖组织相关内容\n\n" +
                        "请严格审核，以JSON输出：{\"verdict\":\"PASS|FAIL\",\"confidence\":0-100,\"reason\":\"...\"}\n" +
                        "verdict为PASS时reason可为null。confidence为你的置信度(0-100整数)。")
                .build();
    }

    @Bean("explicitChatClient")
    public ChatClient explicitChatClient(ChatClient.Builder builder) {
        return builder
                .defaultSystem("你是音乐内容色情低俗审核专家。你负责审核音乐内容的色情低俗维度：\n" +
                        "- 色情、低俗内容\n" +
                        "- 侮辱性语言\n" +
                        "- 不良价值观引导\n" +
                        "- 庸俗化表达\n\n" +
                        "请严格审核，以JSON输出：{\"verdict\":\"PASS|FAIL\",\"confidence\":0-100,\"reason\":\"...\"}\n" +
                        "verdict为PASS时reason可为null。confidence为你的置信度(0-100整数)。")
                .build();
    }

    @Bean("antiSocialChatClient")
    public ChatClient antiSocialChatClient(ChatClient.Builder builder) {
        return builder
                .defaultSystem("你是音乐内容反社会反人类审核专家。你负责审核音乐内容的反社会反人类维度：\n" +
                        "- 反社会、反人类言论\n" +
                        "- 煽动仇恨、歧视\n" +
                        "- 非主流思想、极端思想传播\n" +
                        "- 违背社会核心价值观\n\n" +
                        "请严格审核，以JSON输出：{\"verdict\":\"PASS|FAIL\",\"confidence\":0-100,\"reason\":\"...\"}\n" +
                        "verdict为PASS时reason可为null。confidence为你的置信度(0-100整数)。")
                .build();
    }

    // ============================ 裁决 agent (temperature=0.1) ============================

    @Bean("judgeChatClient")
    public ChatClient judgeChatClient(ChatClient.Builder builder) {
        return builder
                .defaultSystem("你是音乐内容审核终审裁决官。你将收到4个维度审核agent的输出结果。\n\n" +
                        "裁决规则：\n" +
                        "- 一票否决：任一agent报FAIL则整体FAIL\n" +
                        "- 置信度：取FAIL agent中最低confidence作为整体置信度；若全PASS则取最低confidence\n" +
                        "- 不通过理由：拼接所有FAIL agent的reason\n\n" +
                        "以JSON输出：{\"verdict\":\"PASS|FAIL\",\"confidence\":0-100,\"failReasons\":\"拼接理由\"}")
                .build();
    }
}
