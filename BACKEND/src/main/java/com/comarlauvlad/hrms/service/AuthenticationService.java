package com.comarlauvlad.hrms.service;

import com.comarlauvlad.hrms.dao.request.SignUpRequest;
import com.comarlauvlad.hrms.dao.request.SigninRequest;
import com.comarlauvlad.hrms.dao.response.JwtAuthenticationResponse;
import com.comarlauvlad.hrms.repository.UserRepository;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.comarlauvlad.hrms.entities.User;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AuthenticationService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    public JwtAuthenticationResponse signup(SignUpRequest request) {
        var user = User.builder().firstName(request.getFirstName()).lastName(request.getLastName())
                .email(request.getEmail().toLowerCase()).password(passwordEncoder.encode(request.getPassword()))
                .role(request.getRole()).avatar(request.getAvatar()).phoneNumber(request.getPhoneNumber())
                .address(request.getAddress()).cnp(request.getCnp()).jobTitle(request.getJobTitle())
                .employmentDate(request.getEmploymentDate()).birthdate(request.getBirthdate()).build();
        userRepository.save(user);
        var jwt = jwtService.generateToken(user);
        return JwtAuthenticationResponse.builder().token(jwt).build();
    }

    public JwtAuthenticationResponse signin(SigninRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword()));
        var user = userRepository.findByEmail(request.getEmail().toLowerCase())
                .orElseThrow(() -> new IllegalArgumentException("Invalid email or password."));
        var jwt = jwtService.generateToken(user);
        return JwtAuthenticationResponse.builder().token(jwt).build();
    }
}
