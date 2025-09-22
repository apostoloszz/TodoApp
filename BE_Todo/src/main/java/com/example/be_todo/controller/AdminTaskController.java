package com.example.be_todo.controller;

import com.example.be_todo.dto.TaskDTO;
import com.example.be_todo.dto.TaskUpdateRequestDTO;
import com.example.be_todo.dto.UserDTO;
import com.example.be_todo.entity.Task;
import com.example.be_todo.entity.Status;
import com.example.be_todo.entity.User;
import com.example.be_todo.service.TaskService;
import com.example.be_todo.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/tasks")
@RequiredArgsConstructor
public class AdminTaskController {

    private final TaskService taskService;
    private final UserService userService;

    @GetMapping("/users")
    public List<UserDTO> getAllUsers() {
        return userService.getAllUsers()
                .stream()
                .map(UserDTO::from)
                .toList();
    }

    // Lấy tất cả task của 1 user
    @GetMapping("/user/{userId}")
    public List<TaskDTO> getTasksByUser(@PathVariable Long userId) {
        return taskService.getTasksByUser(userId)
                .stream()
                .map(TaskDTO::from)
                .toList();
    }

    // Lấy task theo status của 1 user
    @GetMapping("/user/{userId}/status")
    public List<TaskDTO> getTasksByUserAndStatus(@PathVariable Long userId, @RequestParam Status status) {
        return taskService.getTasksByUserAndStatus(userId, status)
                .stream()
                .map(TaskDTO::from)
                .toList();
    }

    // Admin tạo task cho user khác
    @PostMapping("/user/{userId}")
    public TaskDTO createTaskForUser(@PathVariable Long userId, @RequestBody Task task) {
        Task created = taskService.createTask(userId, task, true); // isAdmin = true
        return TaskDTO.from(created);
    }

    // Admin cập nhật task của user khác
    @PutMapping("/{taskId}")
    public TaskDTO updateTask(@PathVariable Long taskId,
                              @RequestBody TaskUpdateRequestDTO request) {
        Task updated = taskService.updateTask(taskId, request, null, true);
        return TaskDTO.from(updated);
    }


    // Admin cập nhật status task của user khác
    @PatchMapping("/{taskId}/status")
    public TaskDTO updateStatus(@PathVariable Long taskId, @RequestParam Status status) {
        Task updated = taskService.updateStatus(taskId, status, null, true);
        return TaskDTO.from(updated);
    }

    // Admin xóa task của user khác
    @DeleteMapping("/{taskId}")
    public void deleteTask(@PathVariable Long taskId) {
        taskService.deleteTask(taskId, null, true);
    }
}
