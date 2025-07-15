package com.example.events.model;

import jakarta.persistence.Embeddable;
import lombok.Data;

@Embeddable
@Data
public class Location {
    private String name;
    private String address;
    private String district;
}
