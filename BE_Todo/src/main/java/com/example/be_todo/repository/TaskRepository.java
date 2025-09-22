package com.example.be_todo.repository;

import com.example.be_todo.entity.Priority;
import com.example.be_todo.entity.Status;
import com.example.be_todo.entity.Task;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface TaskRepository extends JpaRepository<Task, Long> {
    List<Task> findByUserId(Long userId);
    List<Task> findByStatus(Status status);
    List<Task> findByPriority(Priority priority);
    List<Task> findByUserIdAndStatus(Long userId, Status status);
    List<Task> findByCategoryId(Long categoryId);
}

