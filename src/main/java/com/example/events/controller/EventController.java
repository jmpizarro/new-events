package com.example.events.controller;

import com.example.events.model.Event;
import com.example.events.model.EventSummary;
import com.example.events.repository.EventRepository;
import com.example.events.repository.EventSummaryRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@CrossOrigin
public class EventController {

    private final EventRepository eventRepository;
    private final EventSummaryRepository summaryRepository;

    public EventController(EventRepository eventRepository, EventSummaryRepository summaryRepository) {
        this.eventRepository = eventRepository;
        this.summaryRepository = summaryRepository;
    }

    @GetMapping("/events")
    public List<Event> allEvents() {
        return eventRepository.findAll();
    }

    @GetMapping("/events/{id}")
    public ResponseEntity<Event> getEvent(@PathVariable String id) {
        return eventRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/events/date/{date}")
    public List<Event> eventsByDate(@PathVariable String date) {
        return eventRepository.findByDate(date);
    }

    @GetMapping("/summaries")
    public List<EventSummary> summaries() {
        return summaryRepository.findAll();
    }

    @GetMapping("/summaries/latest")
    public ResponseEntity<EventSummary> latestSummary() {
        EventSummary summary = summaryRepository.findFirstByOrderByIdDesc();
        if (summary == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(summary);
    }

    @GetMapping("/health")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("healthy");
    }
}
