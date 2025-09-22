package com.example.be_todo.entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "habits")
public class Habit {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;        // Luyện viết 20 chữ tiếng Trung mỗi ngày
    private String description;
    private int targetDays;      // Số ngày mục tiêu (30)
    private int completedDays;   // Ngày đã hoàn thành

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;
}

