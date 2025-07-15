package com.example.events.repository;

import com.example.events.model.EventSummary;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EventSummaryRepository extends JpaRepository<EventSummary, String> {
    EventSummary findFirstByOrderByIdDesc();
}
