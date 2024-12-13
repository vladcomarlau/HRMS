package com.comarlauvlad.hrms.service;

import com.comarlauvlad.hrms.entities.Avatar;
import com.comarlauvlad.hrms.entities.User;
import com.comarlauvlad.hrms.repository.AvatarRepository;
import com.comarlauvlad.hrms.repository.UserRepository;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedOutputStream;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class AvatarService {
    @Autowired
    private final AvatarRepository avatarRepository;
    @Autowired
    private final UserService userService;
    @Autowired
    private final UserRepository userRepository;
    @Autowired
    private final JwtService jwtService;

    public List<Avatar> getAllAvatars() throws Exception{
        return avatarRepository.findAll();
    }

    public Avatar getAvatarById(String id) throws Exception {
        return avatarRepository.findById(id).get();
    }

    public boolean updateAvatar(String token,
                               MultipartFile file){
        User requestingUser = userService.getUserByEmail(
                jwtService.extractUserName(token.substring(7))).get();
        try {
            String fileName = file.getOriginalFilename();
            String contentType = file.getContentType();
            byte[] fileContent = file.getBytes();
            Avatar savefile = new Avatar(fileName, contentType, fileContent);
            if(requestingUser.getAvatar() != null){
                Optional<Avatar> avatarToDelete =
                        avatarRepository.findById(requestingUser.getAvatar().getId());
                requestingUser.setAvatar(null);
                userRepository.save(requestingUser);
                avatarToDelete.ifPresent(avatar -> avatarRepository.delete(avatar));
            }
            avatarRepository.save(savefile);
            requestingUser.setAvatar(savefile);
            userRepository.save(requestingUser);
            return true;
        }

        catch(Exception e) {
            return false;
        }
    }
}
