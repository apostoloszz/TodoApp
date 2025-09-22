    package com.example.be_todo.dto;

    import com.example.be_todo.entity.Priority;
    import com.example.be_todo.entity.Status;
    import com.example.be_todo.entity.Task;

    import java.time.LocalDateTime;

    public record TaskDTO(
            Long id,
            String title,
            String description,
            String status,
            String priority,
            LocalDateTime dueDate,
            Long userId,
            LocalDateTime createdAt,
            LocalDateTime updatedAt,
            LocalDateTime completedAt
    ) {
        public static TaskDTO from(Task task) {
            return new TaskDTO(
                    task.getId(),
                    task.getTitle(),
                    task.getDescription(),
                    task.getStatus().name(),
                    task.getPriority().name(),
                    task.getDueDate(),
                    task.getUser() != null ? task.getUser().getId() : null,
                    task.getCreatedAt(),
                    task.getUpdatedAt(),
                    task.getCompletedAt()
            );
        }
    }
