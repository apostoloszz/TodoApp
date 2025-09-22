package com.example.be_todo.controller;

import com.example.be_todo.dto.TaskDTO;
import com.example.be_todo.dto.TaskUpdateRequestDTO;
import com.example.be_todo.entity.Task;
import com.example.be_todo.entity.Status;
import com.example.be_todo.entity.User;
import com.example.be_todo.repository.UserRepository;
import com.example.be_todo.service.TaskService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tasks")
@RequiredArgsConstructor
public class TaskController {

    private final TaskService taskService;
    private final UserRepository userRepository;

    // Lấy user hiện tại từ JWT
    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        return userRepository.findAll()
                .stream()
                .filter(u -> u.getUsername().equals(username))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    private boolean isAdmin(Authentication authentication) {
        return authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .anyMatch(role -> role.equals("ROLE_ADMIN"));
    }

    @PostMapping
    public TaskDTO createTask(@RequestBody Task task) {
        User currentUser = getCurrentUser();
        Task created = taskService.createTask(currentUser.getId(), task, false); // isAdmin = false
        return TaskDTO.from(created);
    }


    @PutMapping("/{taskId}")
    public TaskDTO updateTask(@PathVariable Long taskId,
                              @RequestBody TaskUpdateRequestDTO request) {
        Task updated = taskService.updateTask(taskId, request, null, false);
        return TaskDTO.from(updated);
    }


    @PatchMapping("/{taskId}/status")
    public Task updateStatus(@PathVariable Long taskId, @RequestParam Status status) {
        User currentUser = getCurrentUser();
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return taskService.updateStatus(taskId, status, currentUser.getId(), isAdmin(auth));
    }

    @DeleteMapping("/{taskId}")
    public void deleteTask(@PathVariable Long taskId) {
        User currentUser = getCurrentUser();
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        taskService.deleteTask(taskId, currentUser.getId(), isAdmin(auth));
    }

    @GetMapping
    public List<Task> getMyTasks() {
        User currentUser = getCurrentUser();
        return taskService.getTasksByUser(currentUser.getId());
    }

    @GetMapping("/status")
    public List<Task> getMyTasksByStatus(@RequestParam Status status) {
        User currentUser = getCurrentUser();
        return taskService.getTasksByUserAndStatus(currentUser.getId(), status);
    }
}
