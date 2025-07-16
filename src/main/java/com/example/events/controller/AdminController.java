package com.example.events.controller;

import com.example.events.model.AdminConfig;
import com.example.events.repository.AdminConfigRepository;
import com.example.events.repository.EventRepository;
import com.example.events.repository.EventSummaryRepository;
import com.example.events.service.OpenAiService;
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
        logger.info("Get valencia event prompt: {} ", configs.get(0).getValenciaEventsPrompt());
        logger.info("Get valencia summary event prompt: {} ", configs.get(0).getValenciaSummaryPrompt());
        logger.info("Get valencia summary event prompt: {} ", configs.get(0).getCategories());
        if (configs.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(configs.get(0));
    }

    @PutMapping("/config")
    public ResponseEntity<Void> updateConfig(@RequestHeader("Authorization") String token,
                                             @RequestBody AdminConfig config) {
        if (!"Bearer admin-token".equals(token)) {
            return ResponseEntity.status(401).build();
        }
        logger.info("PUT config:  {} configs",config);
        configRepository.deleteAll();
        configRepository.save(config);
        return ResponseEntity.ok().build();
    }

    static class GenerateRequest {
        public String start_date;
        public String end_date;
    }

    @PostMapping("/generate-events")
    public ResponseEntity<?> generateEvents(@RequestHeader("Authorization") String token,
                                            @RequestBody GenerateRequest request) {
        if (!"Bearer admin-token".equals(token)) {
            return ResponseEntity.status(401).build();
        }
        AdminConfig config = configRepository.findAll().stream().findFirst().orElse(null);
        if (config == null || config.getOpenaiApiKey() == null || config.getOpenaiApiKey().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("detail", "OpenAI API key not configured"));
        }
        String prompt = config.getValenciaEventsPrompt()
                .replace("{{start_date}}", request.start_date)
                .replace("{{end_date}}", request.end_date);
        String response = aiService.chat(prompt);
        // For brevity we skip JSON parsing and storing events
        return ResponseEntity.ok(Map.of("response", response));
    }

    @PostMapping("/generate-summary")
    public ResponseEntity<?> generateSummary(@RequestHeader("Authorization") String token,
                                             @RequestBody GenerateRequest request) {
        if (!"Bearer admin-token".equals(token)) {
            return ResponseEntity.status(401).build();
        }
        AdminConfig config = configRepository.findAll().stream().findFirst().orElse(null);
        if (config == null || config.getOpenaiApiKey() == null || config.getOpenaiApiKey().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("detail", "OpenAI API key not configured"));
        }
        String prompt = config.getValenciaSummaryPrompt()
                .replace("{{start_date}}", request.start_date)
                .replace("{{end_date}}", request.end_date);
        String response = aiService.chat(prompt);
        return ResponseEntity.ok(Map.of("response", response));
    }
}
