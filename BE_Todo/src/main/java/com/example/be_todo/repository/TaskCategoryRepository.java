package com.example.be_todo.repository;

import com.example.be_todo.entity.TaskCategory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface TaskCategoryRepository extends JpaRepository<TaskCategory, Long> {
        List<TaskCategory> findByUserId(Long userId);
        Optional<TaskCategory> findByIdAndUserId(Long categoryId, Long userId);

}
