package com.example.events.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
public class AdminConfig {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    private String city = "Valencia";

    @ElementCollection
    private java.util.List<String> categories;

    private String openaiApiKey;

    @Column(length = 2000)
    private String valenciaEventsPrompt;

    @Column(length = 2000)
    private String valenciaSummaryPrompt;
}
