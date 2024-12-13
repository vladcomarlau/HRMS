package com.comarlauvlad.hrms.dao.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EvaluationRequest {
    private LocalDate evaluationDate;
    private int user_id;
    private String firstNameUser;
    private String lastNameUser;
    private String managerName;
    private float expertise;
    private float communication;
    private float initiative;
    private float leadership;
    private float efficiency;
    private String feedback;
}
