package com.example.be_todo.service;

import com.example.be_todo.dto.TaskUpdateRequestDTO;
import com.example.be_todo.entity.Task;
import com.example.be_todo.entity.Status;

import java.util.List;

public interface TaskService {
    Task createTask(Long userId, Task task, boolean isAdmin);
    Task updateTask(Long taskId, TaskUpdateRequestDTO request, Long currentUserId, boolean isAdmin);
    Task updateStatus(Long taskId, Status status, Long currentUserId, boolean isAdmin);
    void deleteTask(Long taskId, Long currentUserId, boolean isAdmin);
    List<Task> getTasksByUser(Long userId);
    List<Task> getTasksByUserAndStatus(Long userId, Status status);
}
