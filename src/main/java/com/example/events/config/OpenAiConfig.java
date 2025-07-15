package com.example.events.config;

import org.springframework.ai.client.AiClient;
import org.springframework.ai.openai.OpenAiChatClient;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenAiConfig {

    @Value("${openai.api.key:}")
    private String apiKey;

    @Bean
    public AiClient aiClient() {
        return new OpenAiChatClient(apiKey);
    }
}
