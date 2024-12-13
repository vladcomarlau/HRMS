package com.comarlauvlad.hrms.controller;

import com.comarlauvlad.hrms.dao.request.SalaryRequest;
import com.comarlauvlad.hrms.entities.Salary;
import com.comarlauvlad.hrms.service.SalaryService;
import com.comarlauvlad.hrms.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class SalaryController {
    private static ResourceBundle ROBundle = ResourceBundle.getBundle("strings");
    @Autowired
    SalaryService salaryService;
    @Autowired
    private UserService userService;

    @GetMapping("/salaries")
    public ResponseEntity<List<Salary>> getAllSalaries(
            @RequestHeader(name="Authorization") String token) {
        try {
            if(userService.isAdminOrManagerByJWT(token)) {
                return ResponseEntity.ok(salaryService.getAllSalaries());
            }
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/salaries/users")
    public ResponseEntity<List<Map>> getAllSalariesWithUsersData(
            @RequestHeader(name="Authorization") String token) {
        try {
            if(userService.isAdminOrManagerByJWT(token)) {
                return ResponseEntity.ok(salaryService.getAllSalariesUsersData());
            }
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/salaries/{userId}")
    public ResponseEntity<List<Salary>> getSalariesByUserId(
            @RequestHeader(name="Authorization") String token,
            @PathVariable("userId") long userId){
        try {
            if(userService.isAdminOrManagerByJWT(token)
            || userService.isSameJWTandID(token, userId)) {
                return ResponseEntity.ok(salaryService.getSalariesByUserId(userId));
            }
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/salaries/team/{managerId}")
    public ResponseEntity<List<Salary>> getTeamSalaries(
            @RequestHeader(name="Authorization") String token,
            @PathVariable("managerId") long managerId){
        try {
            if(userService.isAdminOrManagerByJWT(token)) {
                return ResponseEntity.ok(salaryService.getSalariesByManagerId(managerId));
            }
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/salaries/current/{userId}")
    public ResponseEntity<Salary> getCurrentSalaryByUserId(
            @RequestHeader(name="Authorization") String token,
            @PathVariable("userId") long userId){
        try {
            if(userService.isAdminOrManagerByJWT(token)
            || userService.isSameJWTandID(token, userId)) {
                return ResponseEntity.ok(salaryService.getCurrentSalaryByUserId(userId));
            }
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/salaries/map/{userId}")
    public ResponseEntity<Map<String, Object>> getSalaryMapByUserId(
            @RequestHeader(name="Authorization") String token,
            @PathVariable("userId") long userId){
        try {
            if(userService.isAdminOrManagerByJWT(token)
            || userService.isSameJWTandID(token, userId)) {
                return ResponseEntity.ok(salaryService.getSalaryMapByUserId(userId));
            }
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/salaries/{userId}")
    public ResponseEntity<String> saveSalary(
            @RequestHeader(name="Authorization") String token,
            @RequestBody SalaryRequest salaryRequest,
            @PathVariable("userId") long userId) {
        try {
            if(userService.isAdminOrManagerByJWT(token)) {
                salaryService.saveSalary(salaryRequest, userId);
                return ResponseEntity.ok(ROBundle.getString("successSaveSalary"));
            }
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(ROBundle.getString("errorSaveSalary"));
        }
    }

    @DeleteMapping("/salaries/{userId}/{salaryIndex}")
    public ResponseEntity<String> deleteSalary(
            @RequestHeader(name="Authorization") String token,
            @PathVariable("userId") long userId,
            @PathVariable("salaryIndex") int salaryIndex){
        try {
            if(userService.isAdminOrManagerByJWT(token)) {
                salaryService.deleteSalary(userId, salaryIndex);
                return ResponseEntity.ok(ROBundle.getString("successDeleteSalary"));
            }
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(ROBundle.getString("errorDeleteSalary"));
        }
    }
}