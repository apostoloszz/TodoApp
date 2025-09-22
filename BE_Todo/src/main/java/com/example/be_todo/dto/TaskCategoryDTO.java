package com.example.be_todo.dto;

import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class TaskCategoryDTO {
    private Long id;
    private String name;
    private String color;
}
