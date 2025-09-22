package com.example.be_todo.service;

import com.example.be_todo.entity.User;
import java.util.List;
import java.util.Optional;

public interface UserService {
    User createUser(User user);
    User updateUser(Long id, User user);
    void deleteUser(Long id);
    Optional<User> getUserById(Long id);
    User getUser(Long userId);
    List<User> getAllUsers();

    Optional<User> getUserByUsername(String username);
}

