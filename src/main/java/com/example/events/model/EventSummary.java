package com.example.events.model;

import jakarta.persistence.*;
import lombok.Data;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonAlias;

/** Localized text embeddable */
import com.example.events.model.LocalizedText;

import java.util.List;

@Entity
@Data
@JsonIgnoreProperties(ignoreUnknown = true)
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

    @JsonAlias("start_date")
    private String startDate;

    @JsonAlias("end_date")
    private String endDate;

    @ElementCollection
    @JsonAlias("event_types")
    private List<String> eventTypes;
}
