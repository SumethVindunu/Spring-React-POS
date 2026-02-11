package com.sumeth.spring_react_POS.service.impl;

import com.sumeth.spring_react_POS.entity.UserEntity;
import com.sumeth.spring_react_POS.io.UserRequest;
import com.sumeth.spring_react_POS.io.UserResponce;
import com.sumeth.spring_react_POS.repository.UserRepository;
import com.sumeth.spring_react_POS.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public UserResponce createUser(UserRequest request) {
        UserEntity newUser = convertToEntity(request);
        newUser = userRepository.save(newUser);
        return convertToResponce(newUser);
    }

    private UserResponce convertToResponce(UserEntity newUser) {
        return UserResponce.builder()
                .name(newUser.getName())
                .email(newUser.getEmail())
                .userId(newUser.getUserId())
                .password(newUser.getPassword())
                .createdAt(newUser.getCreatedAt())
                .updatedAt(newUser.getUpdatedAt())
                .role(newUser.getRole())
                .build();
    }

    private UserEntity convertToEntity(UserRequest request) {
        return UserEntity.builder()
                .userId(UUID.randomUUID().toString())
                .email(request.getEmail())
                .password(request.getPassword())
                .role(request.getRole().toUpperCase())
                .name(request.getName())
                .build();
    }

    @Override
    public String getUserRole(String email) {
        UserEntity existingUser = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found with email: " + email));
        return existingUser.getRole();
    }

    @Override
    public String getUserPassword(String email) {
        UserEntity existingUser = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found with email: " + email));
        return existingUser.getPassword();
    }

    @Override
    public List<UserResponce> readAllUsers() {
        return userRepository.findAll()
                .stream()
                .map(this::convertToResponce)
                .collect(Collectors.toList());
    }

    @Override
    public UserResponce getUserById(String userId) {
        UserEntity existingUser = userRepository.findByUserId(userId)
                .orElseThrow(() ->
                        new UsernameNotFoundException("User not found with ID: " + userId)
                );

        return convertToResponce(existingUser);
    }

    @Override
    public UserResponce updateUser(String userId, UserRequest request) {
        UserEntity existingUser = userRepository.findByUserId(userId)
                .orElseThrow(() ->
                        new UsernameNotFoundException("User not found with ID: " + userId)
                );

        // Update allowed fields only
        existingUser.setName(request.getName());
        existingUser.setEmail(request.getEmail());

        if (request.getPassword() != null && !request.getPassword().isBlank()) {
            existingUser.setPassword(request.getPassword());
        }

        if (request.getRole() != null) {
            existingUser.setRole(request.getRole().toUpperCase());
        }

        UserEntity updatedUser = userRepository.save(existingUser);

        return convertToResponce(updatedUser);
    }

    @Override
    public void deleteUser(String id) {
        UserEntity existingUser = userRepository.findByUserId(id)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with ID: " + id));
        userRepository.delete(existingUser);
    }
}
