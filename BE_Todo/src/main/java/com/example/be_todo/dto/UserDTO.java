package com.example.be_todo.dto;

import com.example.be_todo.entity.User;

public record UserDTO(Long id, String name, String username, String email) {
    public static UserDTO from(User user) {
        return new UserDTO(user.getId(), user.getName(), user.getUsername(), user.getEmail());
    }
}

