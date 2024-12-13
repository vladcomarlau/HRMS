package com.comarlauvlad.hrms.controller;

import com.comarlauvlad.hrms.dao.request.LeaveRequest;
import com.comarlauvlad.hrms.entities.Leave;
import com.comarlauvlad.hrms.service.LeaveService;
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
public class LeaveController {
    @Autowired
    private LeaveService leaveService;
    @Autowired
    private UserService userService;

    @GetMapping("/leaves")
    public ResponseEntity<List<Leave>> getAllLeaves(
            @RequestHeader(name="Authorization") String token) {
        try {
            if(userService.isAdminOrManagerByJWT(token)) {
                return ResponseEntity.ok(leaveService.getAllLeaves());
            }
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/leaves/users")
    public ResponseEntity<ArrayList<Map>> getInfoLeavesUsers(
            @RequestHeader(name="Authorization") String token) {
        try {
            if(userService.isAdminOrManagerByJWT(token)) {
                return ResponseEntity.ok(leaveService.getInfoDaysOffUsers());
            }
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/leaves/{userId}")
    public ResponseEntity<Map<String, Object>> getLeavesByUserId(
            @RequestHeader(name="Authorization") String token,
            @PathVariable("userId") long userId){
        try {
            if(userService.isAdminOrManagerByJWT(token)
            || userService.isSameJWTandID(token, userId)) {
                return ResponseEntity.ok(leaveService.getLeavesByUserId(userId));
            }
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/leaves/{userId}")
    public ResponseEntity<String> saveLeave(
            @RequestHeader(name="Authorization") String token,
            @PathVariable("userId") long userId,
            @RequestBody LeaveRequest request) {
        try {
            if(userService.isAdminOrManagerByJWT(token)
            || userService.isSameJWTandID(token, userId)) {
                return ResponseEntity.ok(leaveService.saveLeaveForUser(userId, request));
            }
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @PutMapping("/leaves/approve/{id}")
    public ResponseEntity<String> approveLeave(
            @RequestHeader(name="Authorization") String token,
            @PathVariable("id") long leaveId,
            @RequestBody String approver) {
        try {
            if(userService.isAdminOrManagerByJWT(token)) {
                return ResponseEntity.ok(leaveService.approveLeave(leaveId, approver));
            }
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @PutMapping("/leaves/reject/{id}")
    public ResponseEntity<String> rejectLeave(
            @RequestHeader(name="Authorization") String token,
            @PathVariable("id") long leaveId,
            @RequestBody String approver) {
        try {
            if(userService.isAdminOrManagerByJWT(token)) {
                return ResponseEntity.ok(leaveService.rejectLeave(leaveId, approver));
            }
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @DeleteMapping("/leaves/{id}")
    public ResponseEntity<Object> deleteLeave(
            @RequestHeader(name="Authorization") String token,
            @PathVariable("id") long leaveId) {
        try {
            if(userService.isAdminOrManagerByJWT(token)) {
                leaveService.deleteLeave(leaveId);
                return ResponseEntity.ok().build();
            }
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}