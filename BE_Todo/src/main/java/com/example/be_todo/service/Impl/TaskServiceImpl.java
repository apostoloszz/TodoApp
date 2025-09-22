package com.example.be_todo.service.Impl;

import com.example.be_todo.dto.TaskUpdateRequestDTO;
import com.example.be_todo.entity.*;
import com.example.be_todo.repository.TaskCategoryRepository;
import com.example.be_todo.repository.TaskRepository;
import com.example.be_todo.repository.UserRepository;
import com.example.be_todo.service.TaskService;
import com.example.be_todo.service.UserService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TaskServiceImpl implements TaskService {

    private final TaskRepository taskRepository;
    private final UserRepository userRepository;
    private final TaskCategoryRepository taskCategoryRepository;


    //    @Override
//    public Task createTask(Long userId, Task task) {
//        User user = userRepository.findById(userId)
//                .orElseThrow(() -> new EntityNotFoundException("User not found"));
//        task.setUser(user);
//        return taskRepository.save(task);
//    }
    @Override
    public Task createTask(Long userId, Task task, boolean isAdmin) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));

        // Nếu không phải admin thì chỉ được tạo task cho chính mình
        if (!isAdmin) {
            // userId là currentUserId
            task.setUser(user);
        } else {
            // admin có thể gán cho bất kỳ user nào
            task.setUser(user);
        }

        task.setCategory(task.getCategory());
        task.setPriority(task.getPriority() != null ? task.getPriority() : Priority.MEDIUM);
        task.setStatus(task.getStatus() != null ? task.getStatus() : Status.PENDING);
        task.setDueDate(task.getDueDate());
        task.setCreatedAt(LocalDateTime.now());
        task.setUpdatedAt(LocalDateTime.now());

        return taskRepository.save(task);
    }

    @Override
    public Task updateTask(Long taskId, TaskUpdateRequestDTO request, Long currentUserId, boolean isAdmin) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new EntityNotFoundException("Task not found"));

        if (!isAdmin && !task.getUser().getId().equals(currentUserId)) {
            throw new SecurityException("You are not allowed to update this task");
        }

        // Nếu admin gán user mới
        if (request.getUserId() != null) {
            User newUser = userRepository.findById(request.getUserId())
                    .orElseThrow(() -> new EntityNotFoundException("User not found"));

            // Nếu khác user cũ thì reset category
            if (!newUser.getId().equals(task.getUser().getId())) {
                task.setCategory(null); // hoặc set category mặc định
            }

            task.setUser(newUser);
        }

        // Gán category mới nếu có trong request (ưu tiên cái này sau khi reset)
        if (request.getCategoryId() != null) {
            TaskCategory category = taskCategoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new EntityNotFoundException("Category not found"));
            task.setCategory(category);
        }

        task.setTitle(request.getTitle());
        task.setDescription(request.getDescription());
        task.setPriority(request.getPriority());
        task.setStatus(request.getStatus());
        task.setDueDate(request.getDueDate());
        task.setUpdatedAt(LocalDateTime.now());

        return taskRepository.save(task);
    }



    @Override
    public Task updateStatus(Long taskId, Status status, Long currentUserId, boolean isAdmin) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new EntityNotFoundException("Task not found"));

        if (!isAdmin && !task.getUser().getId().equals(currentUserId)) {
            throw new SecurityException("You are not allowed to update status of this task");
        }

        task.setStatus(status);
        return taskRepository.save(task);
    }

    @Override
    public void deleteTask(Long taskId, Long currentUserId, boolean isAdmin) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new EntityNotFoundException("Task not found"));

        if (!isAdmin && !task.getUser().getId().equals(currentUserId)) {
            throw new SecurityException("You are not allowed to delete this task");
        }

        taskRepository.deleteById(taskId);
    }

    @Override
    public List<Task> getTasksByUser(Long userId) {
        return taskRepository.findByUserId(userId);
    }

    @Override
    public List<Task> getTasksByUserAndStatus(Long userId, Status status) {
        return taskRepository.findByUserIdAndStatus(userId, status);
    }
}
