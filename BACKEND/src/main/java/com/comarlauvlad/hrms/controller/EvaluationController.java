package com.comarlauvlad.hrms.controller;

import com.comarlauvlad.hrms.dao.request.EvaluationRequest;
import com.comarlauvlad.hrms.entities.Evaluation;
import com.comarlauvlad.hrms.service.EvaluationService;
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
public class EvaluationController {
    @Autowired
    private EvaluationService evaluationService;
    @Autowired
    private UserService userService;

    @GetMapping("/evaluations")
    public ResponseEntity<List<Evaluation>> getAllEvaluations(
            @RequestHeader (name="Authorization") String token) {
        try {
            if(userService.isAdminOrManagerByJWT(token)) {
                return ResponseEntity.ok(evaluationService.getAllEvaluations());
            }
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/evaluations/teams")
    public ResponseEntity<Map<String, Object>> getAllTeamsPerformance(
            @RequestHeader (name="Authorization") String token) {
        try {
            if(userService.isAdminOrManagerByJWT(token)) {
                return ResponseEntity.ok(evaluationService.getAllTeamsPerformance(true));
            }
            return ResponseEntity.ok(evaluationService.getAllTeamsPerformance(false));
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/evaluations/hierarchy/{managerId}")
    public ResponseEntity<Map<String, Object>> getTeamPerformance(
            @RequestHeader (name="Authorization") String token,
            @PathVariable("managerId") long managerId)  {
        try {
            if(userService.isAdminOrManagerByJWT(token)) {
                return ResponseEntity.ok(evaluationService.getTeamPerformance(managerId));
            }
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/evaluations/current")
    public ResponseEntity<List<Evaluation>> getAllEvaluationsCurrent(
            @RequestHeader (name="Authorization") String token) {
        try {
            if(userService.isAdminOrManagerByJWT(token)) {
                return ResponseEntity.ok(evaluationService.getAllCurrentEvaluations());
            }
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/evaluations/accounts")
    public ResponseEntity<ArrayList<Map>> getEvaluationsAccounts(
            @RequestHeader (name="Authorization") String token)  {
        try {
            if(userService.isAdminOrManagerByJWT(token)) {
                return ResponseEntity.ok(evaluationService.getEvaluationsAccounts());
            }
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/evaluations/{userId}")
    public ResponseEntity<List<Evaluation>> getUserEvaluations(
            @RequestHeader (name="Authorization") String token,
            @PathVariable("userId") long userId){
        try {
            if(userService.isAdminOrManagerByJWT(token)
            || userService.isSameJWTandID(token, userId)) {
                return ResponseEntity.ok(evaluationService.getUserEvaluations(userId));
            }
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/evaluations/{userId}")
    public ResponseEntity<String> saveEvaluation(
            @RequestHeader (name="Authorization") String token,
            @RequestBody EvaluationRequest request,
            @PathVariable("userId") long userId) {
        try {
            if(userService.isAdminOrManagerByJWT(token)) {
                return ResponseEntity.ok(evaluationService.saveEvaluation(request, userId));
            }
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @DeleteMapping("/evaluations/{userId}/{evaluationId}")
    public ResponseEntity<String> deleteEvaluation(
            @RequestHeader (name="Authorization") String token,
            @PathVariable("userId") long userId,
            @PathVariable("evaluationId") long evaluationId){
        try {
            if(userService.isAdminOrManagerByJWT(token)) {
                return ResponseEntity.ok(evaluationService.deleteEvaluationById(userId, evaluationId));
            }
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}