package com.son.auramix.ai.agent;

import com.son.auramix.ai.dto.AgentResult;
import com.son.auramix.ai.dto.ReviewContext;

/**
 * Agent 统一接口，为后续音频审核等扩展预留
 */
public interface ReviewAgent {

    String getName();

    boolean supports(String reviewType);

    AgentResult review(ReviewContext ctx);
}
