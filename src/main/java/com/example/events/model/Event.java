package com.example.events.model;

import jakarta.persistence.*;
import lombok.Data;


@Entity
@Data
public class Event {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Embedded
    @AttributeOverrides({
            @AttributeOverride(name = "en", column = @Column(name = "title_en")),
            @AttributeOverride(name = "es", column = @Column(name = "title_es"))
    })
    private LocalizedText title;
    private String date; // ISO date string

    @Embedded
    private Location location;

    @Embedded
    @AttributeOverrides({
            @AttributeOverride(name = "en", column = @Column(name = "description_en", length = 500)),
            @AttributeOverride(name = "es", column = @Column(name = "description_es", length = 500))
    })
    private LocalizedText description;
    private String imageUrl;

    private String price;

    @Embedded
    private Source source;
}
