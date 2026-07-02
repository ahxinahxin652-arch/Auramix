package com.son.auramix.ai.tool;

import io.micrometer.context.ThreadLocalAccessor;
import reactor.core.publisher.Sinks;

public class ToolEventSinkAccessor implements ThreadLocalAccessor<Sinks.Many<String>> {

    public static final String KEY = "TOOL_EVENT_SINK";
    public static final ThreadLocal<Sinks.Many<String>> SINK = new ThreadLocal<>();

    @Override
    public Object key() {
        return KEY;
    }

    @Override
    public Sinks.Many<String> getValue() {
        return SINK.get();
    }

    @Override
    public void setValue(Sinks.Many<String> value) {
        SINK.set(value);
    }

    @Override
    public void reset() {
        SINK.remove();
    }
}
