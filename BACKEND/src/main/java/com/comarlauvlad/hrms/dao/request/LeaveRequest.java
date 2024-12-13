package com.comarlauvlad.hrms.dao.request;

import com.comarlauvlad.hrms.entities.LeaveState;
import com.comarlauvlad.hrms.entities.LeaveType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LeaveRequest {
    private long ownerUserId;
    private LeaveType type;
    private LocalDate beginDate;
    private LocalDate endDate;
    private int workDaysDuration;
    private LeaveState leaveState = LeaveState.PENDING;
    private String approver;
}
