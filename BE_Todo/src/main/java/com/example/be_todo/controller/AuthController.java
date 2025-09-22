package com.example.be_todo.controller;

import com.example.be_todo.dto.AuthResponse;
import com.example.be_todo.entity.Role;
import com.example.be_todo.entity.User;
import com.example.be_todo.repository.RoleRepository;
import com.example.be_todo.service.UserService;
import org.springframework.web.bind.annotation.*;
import com.example.be_todo.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final UserService userService;
    private final PasswordEncoder passwordEncoder;
    private final RoleRepository roleRepository;

    @PostMapping("/register")
    public User register(@RequestBody User user) {
        user.setPassword(passwordEncoder.encode(user.getPassword()));

        Role userRole = roleRepository.findByName("USER")
                .orElseGet(() -> roleRepository.save(Role.builder().name("USER").build()));

        user.getRoles().add(userRole);

        return userService.createUser(user);
    }

    @PostMapping("/login")
    public AuthResponse login(@RequestBody User user) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        user.getUsername(),
                        user.getPassword()
                )
        );

        String accessToken = jwtService.generateAccessToken(user.getUsername());
        String refreshToken = jwtService.generateRefreshToken(user.getUsername());

        return new AuthResponse(accessToken, refreshToken);
    }

    @PostMapping("/refresh-token")
    public AuthResponse refreshToken(@RequestParam String refreshToken) {
        String username = jwtService.extractUsernameIgnoreExpiration(refreshToken);

        if (!jwtService.isRefreshTokenValid(refreshToken)) {
            throw new RuntimeException("Invalid or expired refresh token");
        }

        String newAccessToken = jwtService.generateAccessToken(username);

        return new AuthResponse(newAccessToken, refreshToken);
    }

}



