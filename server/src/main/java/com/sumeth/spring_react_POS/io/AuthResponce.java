package com.sumeth.spring_react_POS.io;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class AuthResponce {
    private String email;
    private String token;
    private String role;
}
