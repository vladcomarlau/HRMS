package com.comarlauvlad.hrms.controller;

import com.comarlauvlad.hrms.dao.request.PublicHolidayRequest;
import com.comarlauvlad.hrms.entities.PublicHoliday;
import com.comarlauvlad.hrms.service.PublicHolidayService;
import com.comarlauvlad.hrms.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class PublicHolidayController {

    private final PublicHolidayService publicHolidayService;
    private final UserService userService;

    @GetMapping("/publicHolidays")
    public ResponseEntity<List<PublicHoliday>> getAllPublicHolidays() {
        try {
            return ResponseEntity.ok(publicHolidayService.getAllPublicHolidays());
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/publicHolidays/{id}")
    public ResponseEntity<PublicHoliday> getPublicHolidayById(
            @RequestHeader(name="Authorization") String token,
            @PathVariable("id") LocalDate id) {
        try {
            if(userService.isAdminOrManagerByJWT(token)) {
                return ResponseEntity.ok(publicHolidayService.getPublicHolidayById(id));
            }
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/publicHolidays")
    public ResponseEntity<Object> savePublicHoliday(
            @RequestHeader(name="Authorization") String token,
            @RequestBody PublicHolidayRequest publicHolidayRequest) {
        try {
            if(userService.isAdminOrManagerByJWT(token)) {
                publicHolidayService.save(publicHolidayRequest);
                return ResponseEntity.ok().build();
            }
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @DeleteMapping("/publicHolidays/{id}")
    public ResponseEntity<Object> deletePublicHoliday(
            @RequestHeader(name="Authorization") String token,
            @PathVariable("id") LocalDate id) {
        try {
            if(userService.isAdminOrManagerByJWT(token)) {
                publicHolidayService.delete(id);
                return ResponseEntity.ok().build();
            }
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}
