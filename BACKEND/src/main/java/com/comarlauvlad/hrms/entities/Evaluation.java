package com.comarlauvlad.hrms.entities;

import com.comarlauvlad.hrms.dao.request.EvaluationRequest;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "evaluationsTable")
public class Evaluation implements Comparable<Evaluation>{
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    private long user_id;
    private String firstNameUser;
    private String lastNameUser;

    private LocalDate evaluationDate;
    private String managerName;

    private float expertise;
    private float communication;
    private float initiative;
    private float leadership;
    private float efficiency;
    private float average;

    @Column(columnDefinition="LONGTEXT")
    private String feedback;

    public Evaluation(EvaluationRequest request) {
        this.evaluationDate = request.getEvaluationDate();
        this.user_id = request.getUser_id();
        this.lastNameUser = request.getLastNameUser();
        this.firstNameUser = request.getFirstNameUser();
        this.managerName = request.getManagerName();
        this.expertise = request.getExpertise();
        this.communication = request.getCommunication();
        this.initiative = request.getInitiative();
        this.leadership = request.getLeadership();
        this.efficiency = request.getEfficiency();
        this.feedback = request.getFeedback();
        this.average = getAverage();
    }

    public float getAverage() {
        this.average = (this.expertise + this.communication + this.initiative + this.leadership + this.efficiency) / 5;
        return this.average;
    }

    @Override
    public int compareTo(Evaluation otherEvaluation) {
        return evaluationDate.compareTo(otherEvaluation.getEvaluationDate());
    }
}
