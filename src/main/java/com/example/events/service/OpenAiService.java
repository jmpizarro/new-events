package com.example.events.service;

import org.springframework.ai.client.AiClient;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class OpenAiService {

    private final AiClient aiClient;

    @Autowired
    public OpenAiService(AiClient aiClient) {
        this.aiClient = aiClient;
    }

    public String chat(String prompt) {
        return aiClient.generate(prompt);
    }
}
