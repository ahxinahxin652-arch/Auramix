package com.son.auramix.ai.agent;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

@Component
@Order(10)
public class PoliticalSensitivityAgent extends AbstractDimensionAgent implements DimensionAgent {

    public PoliticalSensitivityAgent(@Qualifier("politicalChatClient") ChatClient chatClient) {
        super(chatClient);
    }

    @Override
    public String getName() {
        return "PoliticalSensitivity";
    }

    @Override
    public String getCriteria() {
        return "1) 反国家、颠覆国家政权言论（命中：鼓动推翻政权、否定宪法秩序；豁免：历史叙事、艺术表达）\n" +
               "2) 领土主权不当表述（命中：错误地图认知、否认既定主权归属；豁免：古地名、文学隐喻）\n" +
               "3) 政治领导人侮辱性言论（命中：直接人身侮辱；豁免：政策批评、反讽批判）\n" +
               "4) 政治敏感事件不当评论（命中：对重大灾难/事件幸灾乐祸、煽动对立；豁免：哀悼、反思、批判）\n" +
               "置信度指引：命中证据充分 80-100；证据一般 50-79；仅凭隐喻联想 30-49。";
    }
}
