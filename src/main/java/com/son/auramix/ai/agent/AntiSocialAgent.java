package com.son.auramix.ai.agent;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

@Component
@Order(40)
public class AntiSocialAgent extends AbstractDimensionAgent implements DimensionAgent {

    public AntiSocialAgent(@Qualifier("antiSocialChatClient") ChatClient chatClient) {
        super(chatClient);
    }

    @Override
    public String getName() {
        return "AntiSocial";
    }

    @Override
    public String getCriteria() {
        return "1) 反社会、反人类言论（命中：鼓吹反人类罪、否定人类基本价值；豁免：社会批判、反思）\n" +
               "2) 煽动仇恨、歧视（命中：针对种族/民族/宗教/性别的仇恨煽动；豁免：揭露歧视、反讽）\n" +
               "3) 极端思想传播（命中：宣扬极端主义意识形态；豁免：学术讨论、批判性引用）\n" +
               "4) 违背社会核心价值观（命中：鼓吹违法犯罪、破坏公共秩序；豁免：正当社会批判、维权表达）\n" +
               "置信度指引：命中证据充分 80-100；情绪宣泄与煽动边界 50-70；仅凭不满情绪联想 30-49。";
    }
}
