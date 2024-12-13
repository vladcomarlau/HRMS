package com.comarlauvlad.hrms.entities;

import com.comarlauvlad.hrms.dao.request.SalaryRequest;
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
@Table(name = "salaryTable")
public class Salary implements Comparable<Salary> {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    private LocalDate date;
    private int base = 0;
    private int performanceBonus = 0;
    private int projectBonus = 0;
    private int mealTickets = 0;
    private int lifeInsurance = 0;
    private int subscriptions = 0;

    private String firstNameUser = "";
    private String lastNameUser = "";
    private String managerName = "";
    private int user_id = 0;

    public Salary(LocalDate date, int base, int performanceBonus, int projectBonus, int mealTickets, int lifeInsurance, int subscriptions, int user_id, String firstNameUser, String lastNameUser, String managerName) {
        if(date!=null) {
            this.date = date;
        }
        if(base >= 0) {
            this.base = base;
        }
        if(performanceBonus >= 0) {
            this.performanceBonus = performanceBonus;
        }
        if(mealTickets >= 0) {
            this.mealTickets = mealTickets;
        }
        if(lifeInsurance >= 0) {
            this.lifeInsurance = lifeInsurance;
        }
        if(subscriptions >= 0) {
            this.subscriptions = subscriptions;
        }
        if(projectBonus >= 0) {
            this.projectBonus = projectBonus;
        }
        if(user_id >= 0) {
            this.user_id = user_id;
        }
        if(firstNameUser != null && !firstNameUser.isEmpty()) {
            this.firstNameUser = firstNameUser;
        }
        if(lastNameUser != null && !lastNameUser.isEmpty()) {
            this.lastNameUser = lastNameUser;
        }
        if(managerName != null && !managerName.isEmpty()) {
            this.managerName = managerName;
        }
    }

    public Salary(SalaryRequest request) {
        this.date = request.getDate();
        this.base = request.getBase();
        this.performanceBonus = request.getPerformanceBonus();
        this.projectBonus = request.getProjectBonus();
        this.mealTickets = request.getMealTickets();
        this.lifeInsurance = request.getLifeInsurance();
        this.subscriptions = request.getSubscriptions();
    }

    public int getTotal() {
        return
            this.base
            + this.performanceBonus
            + this.projectBonus
            + this.mealTickets
            + this.lifeInsurance
            + this.subscriptions;
    }

    @Override
    public int compareTo(Salary otherSalary) {
        return date.compareTo(otherSalary.getDate());
    }
}
