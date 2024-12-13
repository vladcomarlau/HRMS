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
public class SalaryRequest {
    private LocalDate date;
    private int base;
    private int performanceBonus;
    private int projectBonus;
    private int mealTickets;
    private int lifeInsurance;
    private int subscriptions;
}
