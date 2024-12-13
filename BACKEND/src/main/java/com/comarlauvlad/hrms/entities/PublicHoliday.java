package com.comarlauvlad.hrms.entities;

import com.comarlauvlad.hrms.dao.request.PublicHolidayRequest;
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
@Table(name = "publicHolidaysTable")
public class PublicHoliday {
    @Id
    private LocalDate beginDate;
    private LocalDate endDate;
    private int workDaysDuration;
    private LeaveType type = LeaveType.PAID_HOLIDAY;
    private String approver;

    public PublicHoliday(PublicHolidayRequest request) {
        if (request != null) {

            if(request.getBeginDate() != null) {
                this.beginDate = request.getBeginDate();
            }

            if(request.getEndDate() != null) {
                this.endDate = request.getEndDate();
            }

            if(request.getWorkDaysDuration() > 0) {
                this.workDaysDuration = request.getWorkDaysDuration();
            }

            if (request.getApprover() != null) {
                this.approver = request.getApprover();
            }
        }
    }
}
