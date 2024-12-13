package com.comarlauvlad.hrms.dao.request;

import com.comarlauvlad.hrms.entities.Avatar;
import com.comarlauvlad.hrms.entities.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SignUpRequest {
    private String firstName;
    private String lastName;
    private String email;
    private String password;
    private Role role;
    private Avatar avatar;
    private String phoneNumber;
    private String cnp;
    private String jobTitle;
    private String address;
    private String birthdate;
    private String employmentDate;
}
