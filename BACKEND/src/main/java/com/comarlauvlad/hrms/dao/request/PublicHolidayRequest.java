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
public class PublicHolidayRequest {
    private LocalDate beginDate;
    private LocalDate endDate;
    private int workDaysDuration;
    private String approver;
}
