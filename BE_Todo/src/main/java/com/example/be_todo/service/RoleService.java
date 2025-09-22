package com.example.be_todo.service;

import com.example.be_todo.entity.Role;
import com.example.be_todo.entity.User;

import java.util.List;
import java.util.Optional;

public interface RoleService {
    Role createRole(Role role);
    Role updateRole(Long id, Role role);
    void deleteRole(Long id);
    Role getRoleById(Long id);
    List<Role> getAllRoles();
    User assignRoleToUser(Long userId, String roleName);
}

