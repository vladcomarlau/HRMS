package com.comarlauvlad.hrms.controller;

import com.comarlauvlad.hrms.dao.request.SignUpRequest;
import com.comarlauvlad.hrms.dao.request.SigninRequest;
import com.comarlauvlad.hrms.dao.response.JwtAuthenticationResponse;
import com.comarlauvlad.hrms.entities.Role;
import com.comarlauvlad.hrms.entities.User;
import com.comarlauvlad.hrms.service.AuthenticationService;
import com.comarlauvlad.hrms.service.JwtService;
import com.comarlauvlad.hrms.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import lombok.RequiredArgsConstructor;

import java.util.Optional;

@RestController
@RequestMapping("/")
@RequiredArgsConstructor
public class AuthenticationController {
    private final AuthenticationService authenticationService;
    @Autowired
    private final UserService userService;
    @Autowired
    private final JwtService jwtService;

    @PostMapping("/signup")
    public ResponseEntity<JwtAuthenticationResponse> signup(
            @RequestHeader (name="Authorization") String token,
            @RequestBody SignUpRequest request) {
        String username = jwtService.extractUserName(token.substring(7));
        System.out.println("AICI USERNAME: " + username);
        Optional<User> requestingUser = userService.getUserByEmail(username);
        if (requestingUser.isPresent() && requestingUser.get().getRole() == Role.ADMIN) {
            return ResponseEntity.ok(authenticationService.signup(request));
        } else {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
    }

    @PostMapping("/signin")
    public ResponseEntity<JwtAuthenticationResponse> signin(
            @RequestBody SigninRequest request) {
        return ResponseEntity.ok(authenticationService.signin(request));
    }
}