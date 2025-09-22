package com.example.be_todo.service;

import com.example.be_todo.dto.TaskCategoryDTO;
import com.example.be_todo.entity.Task;
import com.example.be_todo.entity.Status;
import com.example.be_todo.entity.TaskCategory;

import java.util.List;

public interface PersonalTaskService {
    List<TaskCategory> getAllCategories();
    Task createTask(Long currentUserId, Task task);
    Task updateTask(Long taskId, Task updatedTask, Long currentUserId);
    Task updateStatus(Long taskId, Status status, Long currentUserId);
    void deleteTask(Long taskId, Long currentUserId);
    List<Task> getMyTasks(Long currentUserId);
    List<Task> getMyTasksByStatus(Long currentUserId, Status status);

    void deleteTaskCategory(Long currentUserId, Long categoryId);

    TaskCategory createTaskCategory(Long currentUserId, TaskCategory taskCategory);
    List<TaskCategoryDTO> getTaskCategoriesByUser(Long currentUserId);
}
