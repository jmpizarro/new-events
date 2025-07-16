package com.example.events.model;

import jakarta.persistence.*;
import lombok.Data;

/** Localized text embeddable */
import com.example.events.model.LocalizedText;

import java.util.List;

@Entity
@Data
public class EventSummary {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Embedded
    @AttributeOverrides({
            @AttributeOverride(name = "en", column = @Column(name = "summary_en", length = 1000)),
            @AttributeOverride(name = "es", column = @Column(name = "summary_es", length = 1000))
    })
    private LocalizedText summary;
    private String startDate;
    private String endDate;

    @ElementCollection
    private List<String> eventTypes;
}
