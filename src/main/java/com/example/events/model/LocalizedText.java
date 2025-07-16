package com.example.events.model;

import jakarta.persistence.Embeddable;
import lombok.Data;

@Embeddable
@Data
public class LocalizedText {
    private String en;
    private String es;
}
