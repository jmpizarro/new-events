package com.example.events;

import com.example.events.model.AdminConfig;
import com.example.events.repository.AdminConfigRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;

import java.io.InputStream;
import java.util.Collections;

@Component
public class InitDatabase implements CommandLineRunner {

    private final AdminConfigRepository repo;

    public InitDatabase(AdminConfigRepository repo) {
        this.repo = repo;
    }

    @Override
    public void run(String... args) throws Exception {
        if (repo.count() == 0) {
            ObjectMapper mapper = new ObjectMapper();
            InputStream is = new ClassPathResource("prompts.json").getInputStream();
            JsonNode node = mapper.readTree(is);

            AdminConfig config = new AdminConfig();
            config.setCategories(Collections.emptyList());
            config.setOpenaiApiKey("");
            config.setValenciaEventsPrompt(node.get("valencia_events").get("instruction").asText());
            config.setValenciaSummaryPrompt(node.get("valencia_events_summary").get("instruction").asText());
            repo.save(config);
        }
    }
}
