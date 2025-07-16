package com.example.events.model;

import jakarta.persistence.AttributeOverride;
import jakarta.persistence.AttributeOverrides;
import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import jakarta.persistence.Embedded;
import lombok.Data;

@Embeddable
@Data
public class Location {
    @Embedded
    @AttributeOverrides({
            @AttributeOverride(name = "en", column = @Column(name = "location_name_en")),
            @AttributeOverride(name = "es", column = @Column(name = "location_name_es"))
    })
    private LocalizedText name;
    private String address;
    private String district;
}
