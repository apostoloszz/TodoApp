package com.example.be_todo.controller;

import com.example.be_todo.entity.Status;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/statuses")
public class StatusController {

    @GetMapping
    public Status[] getAllStatuses() {
        return Status.values(); // trả về [ "PENDING", "IN_PROGRESS", "COMPLETED" ]
    }
}



