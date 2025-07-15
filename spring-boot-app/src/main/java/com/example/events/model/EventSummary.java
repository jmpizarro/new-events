package com.example.events.model;

import jakarta.persistence.*;
import lombok.Data;

import java.util.List;

@Entity
@Data
public class EventSummary {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(length = 1000)
    private String summary;
    private String startDate;
    private String endDate;

    @ElementCollection
    private List<String> eventTypes;
}
