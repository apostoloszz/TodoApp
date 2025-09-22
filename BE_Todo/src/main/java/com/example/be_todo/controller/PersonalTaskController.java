package com.example.be_todo.controller;

import com.example.be_todo.dto.TaskCategoryDTO;
import com.example.be_todo.entity.Status;
import com.example.be_todo.entity.Task;
import com.example.be_todo.entity.TaskCategory;
import com.example.be_todo.service.PersonalTaskService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/my-tasks")
@RequiredArgsConstructor
public class PersonalTaskController {

    private final PersonalTaskService personalTaskService;


//    @GetMapping("/categories")
//    public List<TaskCategory> getAllCategories() {
//        return personalTaskService.getAllCategories();
//    }

    @GetMapping
    public List<Task> getMyTasks(@RequestParam Long currentUserId) {
        return personalTaskService.getMyTasks(currentUserId);
    }

    @PostMapping
    public Task createTask(@RequestParam Long currentUserId, @RequestBody Task task) {
        return personalTaskService.createTask(currentUserId, task);
    }

    // Tạo category cho user
    @PostMapping("/categories")
    public TaskCategory createTaskCategory(@RequestParam Long currentUserId,
                                           @RequestBody TaskCategory taskCategory) {
        return personalTaskService.createTaskCategory(currentUserId, taskCategory);
    }

    // Xóa category
    @DeleteMapping("/categories")
    public void deleteCategory(@RequestParam Long currentUserId,
                               @RequestParam Long categoryId) {
        personalTaskService.deleteTaskCategory(currentUserId, categoryId);
    }

    // Lấy tất cả category của user
    @GetMapping("/categories")
    public List<TaskCategoryDTO> getCategoriesByUser(@RequestParam Long currentUserId) {
        return personalTaskService.getTaskCategoriesByUser(currentUserId);
    }

    @PutMapping("/{id}")
    public Task updateTask(@PathVariable Long id, @RequestParam Long currentUserId, @RequestBody Task updatedTask) {
        return personalTaskService.updateTask(id, updatedTask, currentUserId);
    }

    @PatchMapping("/{id}/status")
    public Task updateStatus(@PathVariable Long id, @RequestParam Status status, @RequestParam Long currentUserId) {
        return personalTaskService.updateStatus(id, status, currentUserId);
    }

    @DeleteMapping("/{id}")
    public void deleteTask(@PathVariable Long id, @RequestParam Long currentUserId) {
        personalTaskService.deleteTask(id, currentUserId);
    }
}
