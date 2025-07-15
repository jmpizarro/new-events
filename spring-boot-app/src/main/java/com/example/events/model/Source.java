package com.example.events.model;

import jakarta.persistence.Embeddable;
import lombok.Data;

@Embeddable
@Data
public class Source {
    private String url;
    private String mainUrl;
    private String provider;
}
