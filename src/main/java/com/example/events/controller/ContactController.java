/*
package com.example.events.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/contact")
@CrossOrigin
public class ContactController {
    private final JavaMailSender mailSender;

    @Value("${contact.to.email}")
    private String toEmail;

    public ContactController(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    static class ContactRequest {
        public String name;
        public String email;
        public String message;
    }

    @PostMapping
    public ResponseEntity<Void> sendMessage(@RequestBody ContactRequest request) {
        SimpleMailMessage msg = new SimpleMailMessage();
        msg.setTo(toEmail);
        msg.setSubject("Contact form submission from " + request.name);
        msg.setText("From: " + request.name + " <" + request.email + ">\n\n" + request.message);
        mailSender.send(msg);
        return ResponseEntity.ok().build(); 
    }
}
*/
