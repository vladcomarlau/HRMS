package com.comarlauvlad.hrms.controller;

import com.comarlauvlad.hrms.service.OpenAiApiService;
import com.comarlauvlad.hrms.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
public class OpenAiApiController {
    private final OpenAiApiService openAiApiService;
    private final UserService userService;

    @GetMapping("/openai/{communication}/{efficiency}/{expertise}/{initiative}/{leadership}")
    public ResponseEntity<String> openAi(
            @RequestHeader(name="Authorization") String token,
            @PathVariable int communication, @PathVariable int efficiency,
            @PathVariable int expertise, @PathVariable int initiative,
            @PathVariable int leadership){
        try {
            if(userService.isAdminOrManagerByJWT(token)) {
                return ResponseEntity.ok(openAiApiService.requestOpenAiAPI(communication, efficiency, expertise, initiative, leadership));
            }
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}
