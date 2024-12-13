package com.comarlauvlad.hrms.controller;

import com.comarlauvlad.hrms.entities.Avatar;
import com.comarlauvlad.hrms.service.AvatarService;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedOutputStream;
import java.util.List;
import java.util.ResourceBundle;

@RestController
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class AvatarController {
    private static ResourceBundle ROBundle = ResourceBundle.getBundle("strings");

    @Autowired
    HttpServletResponse response;

    @Autowired
    private AvatarService avatarService;

    @GetMapping("/avatars")
    public ResponseEntity<List<Avatar>> getAllFiles() {
        try {
            return ResponseEntity.ok(avatarService.getAllAvatars());
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/avatars/{id}")
    public ResponseEntity<String> getFile(@PathVariable("id") String id){
        try {
            Avatar avatar = avatarService.getAvatarById(id);
            byte[] content = avatar.getData();
            response.setContentType(avatar.getType());
            response.setHeader("Content-Disposition",
                    "attachment;        filename="+avatar.getName());
            BufferedOutputStream outStream =
                    new BufferedOutputStream(response.getOutputStream());
            outStream.write(content);
            outStream.close();

            return ResponseEntity.ok().build();
        }
        catch(Exception e){
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/avatars")
    public ResponseEntity<String> updateAvatar(@RequestHeader (name="Authorization") String token,
                                               @RequestParam("file") MultipartFile file){
        if (avatarService.updateAvatar(token, file)) {
            return ResponseEntity.ok().body(ROBundle.getString("successAvatarSaved"));
        } else {
            return ResponseEntity.internalServerError().build();
        }
    }
}