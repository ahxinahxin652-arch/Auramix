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
        return "1) 宣扬暴力、恐怖主义（命中：鼓吹恐怖袭击、为恐怖组织招摇；豁免：反恐题材、战争叙事）\n" +
               "2) 极端行为、血腥描写（命中：细致描绘自残/虐杀/分尸且无批判；豁免：医学/历史/文学描写）\n" +
               "3) 煽动暴力冲突（命中：鼓动群体斗殴、报复社会；豁免：情感宣泄、艺术隐喻）\n" +
               "4) 恐怖组织相关内容（命中：展示恐怖组织标识/口号/宣传语；豁免：反恐宣传、新闻报道）\n" +
               "置信度指引：命中证据充分 80-100；证据一般 50-79；仅凭血、杀等字眼联想 30-49。";
    }
}
