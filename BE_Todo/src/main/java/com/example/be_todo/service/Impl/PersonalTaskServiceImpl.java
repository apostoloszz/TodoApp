package com.example.be_todo.service.Impl;

import com.example.be_todo.dto.TaskCategoryDTO;
import com.example.be_todo.entity.Task;
import com.example.be_todo.entity.TaskCategory;
import com.example.be_todo.entity.User;
import com.example.be_todo.entity.Status;
import com.example.be_todo.repository.TaskCategoryRepository;
import com.example.be_todo.repository.TaskRepository;
import com.example.be_todo.repository.UserRepository;
import com.example.be_todo.service.PersonalTaskService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PersonalTaskServiceImpl implements PersonalTaskService {


    private final TaskCategoryRepository categoryRepository;
    private final TaskRepository taskRepository;
    private final UserRepository userRepository;
    private final TaskCategoryRepository taskCategoryRepository;


    @Override
    public List<TaskCategory> getAllCategories() {
        return categoryRepository.findAll();
    }

    @Override
    public Task createTask(Long currentUserId, Task task) {
        User user = userRepository.findById(currentUserId)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));

        if (task.getCategory() != null && task.getCategory().getId() != null) {
            TaskCategory category = taskCategoryRepository.findById(task.getCategory().getId())
                    .orElseThrow(() -> new EntityNotFoundException("Category not found"));
            task.setCategory(category);
        } else {
            task.setCategory(null); // hoặc throw Exception nếu bắt buộc có category
        }
        task.setUser(user);
        task.setStatus(task.getStatus() != null ? task.getStatus() : Status.PENDING);
        task.setCreatedAt(LocalDateTime.now());
        task.setUpdatedAt(LocalDateTime.now());

        return taskRepository.save(task);
    }

    @Override
    public TaskCategory createTaskCategory(Long currentUserId, TaskCategory taskCategory) {
        User user = userRepository.findById(currentUserId)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));

        taskCategory.setUser(user);
        return taskCategoryRepository.save(taskCategory);
    }

    @Override
    public void deleteTaskCategory(Long currentUserId, Long categoryId) {
        TaskCategory category = taskCategoryRepository.findByIdAndUserId(categoryId, currentUserId)
                .orElseThrow(() -> new EntityNotFoundException("Category not found or not owned by user"));

        // Lấy tất cả tasks thuộc category
        List<Task> tasks = taskRepository.findByCategoryId(categoryId);
        for (Task task : tasks) {
            task.setCategory(null); // Bỏ liên kết category
        }
        taskRepository.saveAll(tasks);

        taskCategoryRepository.delete(category);
    }

    @Override
    public List<TaskCategoryDTO> getTaskCategoriesByUser(Long currentUserId) {
        return taskCategoryRepository.findByUserId(currentUserId)
                .stream()
                .map(cat -> new TaskCategoryDTO(cat.getId(), cat.getName(), cat.getColor()))
                .toList();
    }


    @Override
    public Task updateTask(Long taskId, Task updatedTask, Long currentUserId) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new EntityNotFoundException("Task not found"));

        if (!task.getUser().getId().equals(currentUserId)) {
            throw new SecurityException("You are not allowed to update this task");
        }

        if (updatedTask.getCategory() != null && updatedTask.getCategory().getId() != null) {
            TaskCategory category = taskCategoryRepository.findById(updatedTask.getCategory().getId())
                    .orElseThrow(() -> new EntityNotFoundException("Category not found"));
            task.setCategory(category);
        }

        task.setTitle(updatedTask.getTitle());
        task.setDescription(updatedTask.getDescription());
        task.setDueDate(updatedTask.getDueDate());
        task.setPriority(updatedTask.getPriority());
        task.setStatus(updatedTask.getStatus());
        task.setUpdatedAt(LocalDateTime.now());

        return taskRepository.save(task);
    }

    @Override
    public Task updateStatus(Long taskId, Status status, Long currentUserId) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new EntityNotFoundException("Task not found"));

        if (!task.getUser().getId().equals(currentUserId)) {
            throw new SecurityException("You are not allowed to update this task");
        }

        task.setStatus(status);
        task.setUpdatedAt(LocalDateTime.now());
        return taskRepository.save(task);
    }

    @Override
    public void deleteTask(Long taskId, Long currentUserId) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new EntityNotFoundException("Task not found"));

        if (!task.getUser().getId().equals(currentUserId)) {
            throw new SecurityException("You are not allowed to delete this task");
        }

        taskRepository.deleteById(taskId);
    }

    @Override
    public List<Task> getMyTasks(Long currentUserId) {
        return taskRepository.findByUserId(currentUserId);
    }

    @Override
    public List<Task> getMyTasksByStatus(Long currentUserId, Status status) {
        return taskRepository.findByUserIdAndStatus(currentUserId, status);
    }
}

