package com.sumeth.spring_react_POS.controller;


import com.sumeth.spring_react_POS.io.UserRequest;
import com.sumeth.spring_react_POS.io.UserResponce;
import com.sumeth.spring_react_POS.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/admin")
public class UserController {

    private final UserService userService;

    @PostMapping("/register")
    public UserResponce registerUser(@RequestBody UserRequest request) {
        try{
            return userService.createUser(request);
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Unable to Create user: " + e.getMessage());
        }
    }

    @GetMapping("/users")
    public List<UserResponce> readUsers() {
        return userService.readAllUsers();
    }

    @GetMapping("/users/{userId}")
    public UserResponce getUserById(@PathVariable String userId) {
        try {
            return userService.getUserById(userId);
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found with id: " + userId);
        }
    }

    @PutMapping("/users/{userId}")
    public UserResponce updateUser(@PathVariable String userId, @RequestBody UserRequest request) {
        try {
            return userService.updateUser(userId, request);
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Unable to update user: " + e.getMessage());
        }
    }

    @DeleteMapping("/users/{userId}")
    public String deleteUser(@PathVariable String userId) {
        try {
            userService.deleteUser(userId);
            return "User with id " + userId + " has been deleted successfully.";
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Unable to delete user: " + e.getMessage());
        }
    }


}
