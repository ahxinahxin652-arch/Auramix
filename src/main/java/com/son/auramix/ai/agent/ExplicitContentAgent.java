package com.son.auramix.ai.agent;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

@Component
@Order(30)
public class ExplicitContentAgent extends AbstractDimensionAgent implements DimensionAgent {

    public ExplicitContentAgent(@Qualifier("explicitChatClient") ChatClient chatClient) {
        super(chatClient);
    }

    @Override
    public String getName() {
        return "ExplicitContent";
    }

    @Override
    public String getCriteria() {
        return "1) 色情、低俗内容（命中：露骨性描写、明显性暗示；豁免：情感表达、艺术隐喻）\n" +
               "2) 侮辱性语言（命中：针对群体的谩骂、人格侮辱；豁免：自嘲、反讽）\n" +
               "3) 不良价值观引导（命中：鼓吹违法/吸毒/嫖娼等行为；豁免：批判、警示）\n" +
               "4) 庸俗化表达（命中：以低俗博眼球、毫无艺术性的粗鄙表达；豁免：方言俗语、生活化表达）\n" +
               "置信度指引：命中证据充分 80-100；双关语边界 50-70；仅凭单字联想 30-49。";
    }
}
