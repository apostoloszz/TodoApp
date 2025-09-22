package com.example.be_todo.dto;

import com.example.be_todo.entity.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class TaskUpdateRequestDTO {
    private String title;
    private String description;
    private Status status;
    private Priority priority;
    private LocalDateTime dueDate;
    private Long userId;
    private Long categoryId;
}

