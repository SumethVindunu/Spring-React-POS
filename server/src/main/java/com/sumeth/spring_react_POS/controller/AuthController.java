package com.sumeth.spring_react_POS.controller;

import com.sumeth.spring_react_POS.io.AuthRequest;
import com.sumeth.spring_react_POS.io.AuthResponce;
import com.sumeth.spring_react_POS.service.UserService;
import com.sumeth.spring_react_POS.service.impl.AppUserDetailsService;
import com.sumeth.spring_react_POS.service.impl.UserServiceImpl;
import com.sumeth.spring_react_POS.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.net.PasswordAuthentication;
import java.util.Map;

@RestController
@RequiredArgsConstructor
public class AuthController {

    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final AppUserDetailsService appUserDetailsService;
    private final JwtUtil jwtUtil;
    private final UserService userService;

    @PostMapping("/login1")
    public String test(@RequestBody AuthRequest request){
        try{
            String email = request.getEmail();
            String password = request.getPassword();
            authenticate(email, password);

            return "Hello World" + email + " " + password;
        }
        catch (Exception e){
            return e.getMessage();
        }
    }

    @PostMapping("/login")
    public AuthResponce login(@RequestBody AuthRequest request)  {
        try{
            final UserDetails userDetails = appUserDetailsService.loadUserByUsername(request.getEmail());
            authenticate(request.getEmail(), request.getPassword());
            final String jwtToken = jwtUtil.generateToken(userDetails);
            String role = userService.getUserRole(request.getEmail());
            return new AuthResponce(request.getEmail(),  jwtToken , role);


        }catch (Exception e){
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid Email or Passsword");
        }
    }

    private void authenticate(String email, String password) throws Exception {

        String correctPassword = userService.getUserPassword(email);
        if (correctPassword == null) {
            throw new Exception("Invalid email of password: " + email);
        }
        if (!correctPassword.equals(password)) {
            throw new Exception("Invalid password");
        }
    }

    @PostMapping("/encode")
    public String encodePassword(@RequestBody String request) {
            return passwordEncoder.encode(request);
    }



}
