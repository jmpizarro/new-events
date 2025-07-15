package com.example.events.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
public class Event {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    private String title;
    private String date; // ISO date string

    @Embedded
    private Location location;

    @Column(length = 500)
    private String description;
    private String imageUrl;

    @Embedded
    private Source source;
}
