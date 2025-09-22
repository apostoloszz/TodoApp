package com.example.be_todo.controller;

import com.example.be_todo.entity.Priority;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/priorities")
public class PriorityController {

    @GetMapping
    public Priority[] getAllPriorities() {
        return Priority.values(); // [ "LOW", "MEDIUM", "HIGH" ]
    }
}


