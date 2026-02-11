package com.sumeth.spring_react_POS.service;

import com.sumeth.spring_react_POS.io.UserRequest;
import com.sumeth.spring_react_POS.io.UserResponce;

import java.util.List;

public interface UserService {
    UserResponce createUser(UserRequest request);

    String getUserRole(String email);

    String getUserPassword(String email);

    List<UserResponce> readAllUsers();

    UserResponce getUserById(String userId);   // ✅ NEW

    UserResponce updateUser(String userId, UserRequest request); // ✅ NEW

    void deleteUser(String userId);
}
