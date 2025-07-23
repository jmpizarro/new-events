package com.example.events.controller;

import com.example.events.model.AdminConfig;
import com.example.events.model.Event;
import com.example.events.model.EventSummary;
import com.example.events.repository.AdminConfigRepository;
import com.example.events.repository.EventRepository;
import com.example.events.repository.EventSummaryRepository;
import com.example.events.service.OpenAiService;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.DeserializationFeature;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin
public class AdminController {

    private final AdminConfigRepository configRepository;
    private final EventRepository eventRepository;
    private final EventSummaryRepository summaryRepository;
    private final OpenAiService aiService;
    private static final Logger logger = LoggerFactory.getLogger(AdminController.class);

    public AdminController(AdminConfigRepository configRepository,
                           EventRepository eventRepository,
                           EventSummaryRepository summaryRepository,
                           OpenAiService aiService) {
        this.configRepository = configRepository;
        this.eventRepository = eventRepository;
        this.summaryRepository = summaryRepository;
        this.aiService = aiService;
    }

    @PostMapping("/login")
    public ResponseEntity<Map<String, String>> login(@RequestBody Map<String, String> login) {
        if ("admin".equals(login.get("username")) && "password".equals(login.get("password"))) {
            return ResponseEntity.ok(Map.of("token", "admin-token"));
        }
        return ResponseEntity.status(401).build();
    }

    @GetMapping("/config")
    public ResponseEntity<AdminConfig> getConfig(@RequestHeader("Authorization") String token) {
        if (!"Bearer admin-token".equals(token)) {
            return ResponseEntity.status(401).build();
        }
        List<AdminConfig> configs = configRepository.findAll();
        if (configs.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(configs.get(0));
    }

    @PutMapping("/config")
    public ResponseEntity<Void> updateConfig(@RequestHeader("Authorization") String token,
                                             @RequestBody AdminConfig updated) {
        if (!"Bearer admin-token".equals(token)) {
            return ResponseEntity.status(401).build();
        }
        logger.info("PUT config:  {}", updated);
        AdminConfig config = configRepository.findAll().stream().findFirst().orElse(new AdminConfig());
        config.setCity(updated.getCity());
        config.setCategories(updated.getCategories());
        config.setStartDate(updated.getStartDate());
        config.setEndDate(updated.getEndDate());
        configRepository.deleteAll();
        configRepository.save(config);
        return ResponseEntity.ok().build();
    }

    static class GenerateRequest {
        public String start_date;
        public String end_date;
    }

    /**
     * Extracts the assistant message text from the JSON returned by the
     * OpenAI responses API. If the payload does not match the expected
     * structure, {@code null} is returned.
     */
    private String getResponseText(String json) {
        if (json == null || json.isBlank()) {
            return null;
        }
        try {
            ObjectMapper mapper = new ObjectMapper();
            JsonNode root = mapper.readTree(json);
            JsonNode output = root.path("output");
            if (output.isArray()) {
                for (JsonNode node : output) {
                    if ("message".equals(node.path("type").asText())) {
                        JsonNode content = node.path("content");
                        if (content.isArray() && !content.isEmpty()) {
                            return content.get(0).path("text").asText();
                        }
                    }
                }
            }
        } catch (Exception e) {
            logger.error("Failed to extract response text", e);
        }
        return null;
    }

    /**
     * OpenAI often wraps JSON responses in a Markdown code block. This utility
     * removes the opening and closing fences so the content can be parsed by
     * Jackson.
     */
    private String extractJson(String response) {
        if (response == null) {
            return null;
        }
        String trimmed = response.trim();
        if (trimmed.startsWith("```")) {
            int firstNewline = trimmed.indexOf('\n');
            if (firstNewline > -1) {
                trimmed = trimmed.substring(firstNewline + 1);
            }
        }
        if (trimmed.endsWith("```")) {
            trimmed = trimmed.substring(0, trimmed.length() - 3);
        }
        return trimmed.trim();
    }

    @PostMapping("/generate-events")
    public ResponseEntity<?> generateEvents(@RequestHeader("Authorization") String token,
                                            @RequestBody GenerateRequest request) {
        if (!"Bearer admin-token".equals(token)) {
            return ResponseEntity.status(401).build();
        }
        AdminConfig config = configRepository.findAll().stream().findFirst().orElse(null);
        if (config == null) {
            return ResponseEntity.badRequest().body(Map.of("detail", "Admin config not found"));
        }
        logger.info("config: " + config);
        configRepository.save(config);

        String prompt = config.getValenciaEventsPrompt()
                .replace("{{start_date}}", config.getStartDate())
                .replace("{{end_date}}", config.getEndDate());
        logger.info("Prompt before calling: " + prompt);
        
        String response = aiService.chat(prompt);
        String rawText = getResponseText(response);
        if (rawText != null) {
            response = rawText;
        }
        response = extractJson(response);
        logger.info("Response from Open IA: " + response);
        try {
            ObjectMapper mapper = new ObjectMapper();
            Event[] events = mapper.readValue(response, Event[].class);
            eventRepository.deleteAll();
            eventRepository.saveAll(List.of(events));
            logger.info("Saving events: " + events);
            return ResponseEntity.ok(Map.of("message", "Events generated"));
        } catch (Exception e) {
            logger.error("Failed to parse events", e);
            return ResponseEntity.badRequest().body(Map.of("detail", "Invalid response from AI"));
        }
    }

    @PostMapping("/generate-summary")
    public ResponseEntity<?> generateSummary(@RequestHeader("Authorization") String token,
                                             @RequestBody GenerateRequest request) {
        if (!"Bearer admin-token".equals(token)) {
            return ResponseEntity.status(401).build();
        }
        AdminConfig config = configRepository.findAll().stream().findFirst().orElse(null);
        if (config == null) {
            return ResponseEntity.badRequest().body(Map.of("detail", "Admin config not found"));
        }
        // update dates in config
        config.setStartDate(request.start_date);
        config.setEndDate(request.end_date);
        configRepository.save(config);

        String prompt = config.getValenciaSummaryPrompt()
                .replace("{{start_date}}", config.getStartDate())
                .replace("{{end_date}}", config.getEndDate());
        String response = aiService.chat(prompt);
        String rawText = getResponseText(response);
        if (rawText != null) {
            response = rawText;
        }
        response = extractJson(response);
        try {
            ObjectMapper mapper = new ObjectMapper();
            mapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
            EventSummary summary = mapper.readValue(response, EventSummary.class);
            summaryRepository.deleteAll();
            summaryRepository.save(summary);
            return ResponseEntity.ok(Map.of("message", "Summary generated"));
        } catch (Exception e) {
            logger.error("Failed to parse summary", e);
            return ResponseEntity.badRequest().body(Map.of("detail", "Invalid response from AI"));
        }
    }

    @PostMapping("/upload-events")
    public ResponseEntity<?> uploadEvents(@RequestHeader("Authorization") String token,
                                          @RequestBody String eventsJson) {
        if (!"Bearer admin-token".equals(token)) {
            return ResponseEntity.status(401).build();
        }
        try {
            ObjectMapper mapper = new ObjectMapper();
            Event[] events = mapper.readValue(eventsJson, Event[].class);
            eventRepository.deleteAll();
            eventRepository.saveAll(List.of(events));
            logger.info("Uploaded events: " + events.length);
            return ResponseEntity.ok(Map.of("message", "Events uploaded"));
        } catch (Exception e) {
            logger.error("Failed to parse uploaded events", e);
            return ResponseEntity.badRequest().body(Map.of("detail", "Invalid events file"));
        }
    }
}
