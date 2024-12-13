package com.comarlauvlad.hrms.controller;

import com.comarlauvlad.hrms.entities.User;
import com.comarlauvlad.hrms.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequiredArgsConstructor
public class UserController {
    private static ResourceBundle myBundle = ResourceBundle.getBundle("strings");

    @Autowired
    private final UserService userService;

    @Value("${app.hierarchyRootId}")
    private long hierarchyRoot;

    @CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
    @GetMapping("/users")
    public ResponseEntity<List<User>> getAllUsers(
            @RequestHeader(name="Authorization") String token) {
        try {
            if(userService.isAdminOrManagerByJWT(token)) {
                return ResponseEntity.ok(userService.getAllUsers());
            }
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/users/search")
    public ResponseEntity<ArrayList<Map>> getAllUsersSearchList() {
        try {
            return ResponseEntity.ok(userService.getAllUsersSearchlist());
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/users/{id}")
    public ResponseEntity<Object> getUser(
            @RequestHeader(name="Authorization") String token,
            @PathVariable("id") long userId) {
        try {
            if(userService.isAdminOrManagerByJWT(token)) {
                return ResponseEntity.ok(userService.getUserById(userId));
            } else {
                return ResponseEntity.ok(userService.getUserByIdSimplified(userId));
            }
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/users/organigram")
    public ResponseEntity<ArrayList<Map>> getOrganigram() {
        try {
            return ResponseEntity.ok(userService.generateOrganigram(hierarchyRoot));
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/users/simplifiedForReports")
    public ResponseEntity<ArrayList<Map>> getUsersForReports(
            @RequestHeader (name="Authorization") String token) {
        try {
            if(userService.isAdminOrManagerByJWT(token)) {
                return ResponseEntity.ok(userService.getUsersForReports());
            }
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/users/{id}/hierarchy")
    public ResponseEntity<Map<String, Object>> getHierarchy(@PathVariable("id") long userId) {
        try {
            return ResponseEntity.ok(userService.getHierarchy(userId));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/users/correlation/{id}")
    public ResponseEntity<Map> getCorrelation(
            @RequestHeader (name="Authorization") String token,
            @PathVariable("id") long userId) {
        try {
            if(userService.isAdminOrManagerByJWT(token)) {
                return ResponseEntity.ok(userService.getSalaryPerformanceCorrelation(userId));
            }
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/users/subordinates/{id}")
    public ResponseEntity<Boolean> checkUserHasSubordinates(@PathVariable("id") long userId) {
        try {
            return ResponseEntity.ok(userService.userHasSubordinates(userId));
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/users/{managerId}/{subordinateId}")
    public ResponseEntity<String> setManager(
            @RequestHeader (name="Authorization") String token,
            @PathVariable("managerId") long managerId,
            @PathVariable("subordinateId") long subordinateId) {
        try {
            if(userService.isAdminOrManagerByJWT(token)) {
                return ResponseEntity.ok(userService.setManager(managerId, subordinateId));
            }
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @PutMapping("/users/{newManagerId}/{oldManagerId}")
    public ResponseEntity<String> setTeamManager(
            @RequestHeader (name="Authorization") String token,
            @PathVariable("newManagerId") long newManagerId,
            @PathVariable("oldManagerId") long oldManagerId) {
        try {
            if(userService.isAdminOrManagerByJWT(token)) {
                return ResponseEntity.ok(userService.setTeamManager(newManagerId, oldManagerId));
            }
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @PutMapping("/users/{userId}/leaveDays/{numberOfDays}")
    public ResponseEntity<String> setZile(
            @RequestHeader (name="Authorization") String token,
            @PathVariable("userId") long userId,
            @PathVariable("numberOfDays") int numberOfDays) {
        try {
            if(userService.isAdminOrManagerByJWT(token)) {
                return ResponseEntity.ok(userService.setLeaveDays(userId, numberOfDays));
            }
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @PutMapping("/users/{id}")
    public ResponseEntity<User> updateUser(
            @RequestHeader (name="Authorization") String token,
            @RequestBody User user, @PathVariable("id") long userId) {
        try {
            if(userService.isAdminOrManagerByJWT(token)
            || userService.isSameJWTandID(token, userId)) {
                return ResponseEntity.ok(userService.updateUser(token, user, userId));
            }
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @RequestMapping(value = "/users/jwt", method = RequestMethod.GET)
    public ResponseEntity<User> getUserByToken(@RequestHeader (name="Authorization") String token) {
        try {
            return ResponseEntity.ok(userService.getUserByToken(token));
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<String> deleteUserById(
            @RequestHeader (name="Authorization") String token,
            @PathVariable("id") long id) {
        try {
            if(userService.isAdminOrManagerByJWT(token)) {
                return ResponseEntity.ok(userService.deleteUserById(id));
            }
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @DeleteMapping("/users/{managerId}/{subordinateId}")
    public ResponseEntity<String> deleteFromTeam(
            @RequestHeader (name="Authorization") String token,
            @PathVariable("managerId") long managerId,
            @PathVariable("subordinateId") long subordinateId) {
        try {
            if(userService.isAdminOrManagerByJWT(token)) {
                return ResponseEntity.ok(userService.deleteFromTeam(managerId, subordinateId));
            }
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}
