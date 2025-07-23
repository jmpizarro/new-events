package com.example.events.service;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.time.Duration;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class OpenAiService {

    private final ChatClient chatClient;
    private final RestTemplate restTemplate;
    private final String apiKey;

    @Autowired
    public OpenAiService(ChatClient.Builder chatClientBuilder,
                         RestTemplateBuilder restTemplateBuilder,
                         @Value("${spring.ai.openai.api-key}") String apiKey) {
        this.chatClient = chatClientBuilder.build();
        this.restTemplate = restTemplateBuilder
                .setConnectTimeout(Duration.ofSeconds(30))
                .setReadTimeout(Duration.ofMinutes(3))
                .build();
        this.apiKey = apiKey;
    }

    public String chat(String prompt) {
        return this.chatClient.prompt()
                .user(prompt)
                .call()
                .content();
    }

    public String webSearch(String input) {
        String url = "https://api.openai.com/v1/responses";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(apiKey);

        Map<String, Object> tool = new HashMap<>();
        tool.put("type", "web_search_preview");
        tool.put("search_context_size", "high"); 

        Map<String, Object> body = new HashMap<>();
        body.put("model", "gpt-4.1-mini");
        body.put("tools", List.of(tool));
        body.put("input", input);

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);

        try {
            ResponseEntity<String> response = restTemplate.postForEntity(url, request, String.class);
            return response.getBody();
        } catch (RestClientException ex) {
            throw new RuntimeException("Failed to call OpenAI", ex);
        }
    }
}
