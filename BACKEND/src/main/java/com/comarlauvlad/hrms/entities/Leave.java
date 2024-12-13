package com.comarlauvlad.hrms.entities;

import com.comarlauvlad.hrms.dao.request.LeaveRequest;
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
@Table(name = "leavesTable")
public class Leave {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;
    private long ownerUserId;
    LeaveType type;
    private LocalDate beginDate;
    private LocalDate endDate;
    private int workDaysDuration = 0;
    private LeaveState leaveState = LeaveState.PENDING;
    private String approver = "";

    public Leave(LeaveRequest request) {
        if (request != null) {
            this.ownerUserId = request.getOwnerUserId();

            if(request.getType() != null) {
                this.type = request.getType();
            }

            if(request.getBeginDate() != null) {
                this.beginDate = request.getBeginDate();
            }

            if(request.getEndDate() != null) {
                this.endDate = request.getEndDate();
            }

            if(request.getWorkDaysDuration() > 0) {
                this.workDaysDuration = request.getWorkDaysDuration();
            }

            this.leaveState = request.getLeaveState();

            if (request.getApprover() != null) {
                this.approver = request.getApprover();
            }
        }
    }
}
