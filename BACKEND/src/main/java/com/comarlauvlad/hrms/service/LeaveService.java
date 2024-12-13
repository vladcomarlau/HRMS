package com.comarlauvlad.hrms.service;

import com.comarlauvlad.hrms.dao.request.LeaveRequest;
import com.comarlauvlad.hrms.entities.Leave;
import com.comarlauvlad.hrms.entities.LeaveState;
import com.comarlauvlad.hrms.entities.User;
import com.comarlauvlad.hrms.repository.LeaveRepository;
import com.comarlauvlad.hrms.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
@RequiredArgsConstructor
public class LeaveService {
    public static ResourceBundle ROBundle = ResourceBundle.getBundle("strings");
    @Autowired
    private final LeaveRepository leaveRepository;
    @Autowired
    private final UserRepository userRepository;
    @Autowired
    private final PublicHolidayService publicHolidayService;

    public Map<String, Object> getLeavesByUserId(long userId) {
        Optional<User> user = userRepository.findById(userId);
        Map<String, Object> response = new HashMap<>();
        if(user.isPresent()){
            response.put("leaveDays", user.get().getLeaveDays());
            response.put("leaves", user.get().getLeaves());
            response.put("publicHolidays", publicHolidayService.getAllPublicHolidays());
        }
        return response;
    }

    public List<Leave> getAllLeaves() {
        return leaveRepository.findAll();
    }

    public ArrayList<Map> getInfoDaysOffUsers() {
        List<User> users = userRepository.findAll();
        ArrayList<Map> response = new ArrayList<>();
        for (User user : users) {
            Map<String, Object> userInfo = new HashMap<>();
            userInfo.put("id", user.getId());
            userInfo.put("firstName", user.getFirstName());
            userInfo.put("lastName", user.getLastName());
            userInfo.put("fullName", user.getFullName());
            if(user.getManager() != null) {
                Map<String, Object> managerMap = new HashMap<>();
                managerMap.put("id", user.getManager().getId());
                managerMap.put("firstName", user.getManager().getFirstName());
                managerMap.put("lastName", user.getManager().getLastName());
                userInfo.put("manager", managerMap);
            }
            userInfo.put("leaveDays", user.getLeaveDays());
            userInfo.put("countPendingLeaves", user.getCountPendingLeaves());
            response.add(userInfo);
        }
        return response;
    }

    public String saveLeaveForUser(long userId, LeaveRequest request) {
        Optional<User> user = userRepository.findById(userId);
        if(request != null
                && (request.getBeginDate().isEqual(request.getEndDate())
                || request.getBeginDate().isBefore(request.getEndDate()))
        ){
            User userObj = user.get();
            userObj.getLeaves().add(new Leave(request));
            if(userObj.getLeaveDays() - request.getWorkDaysDuration() >= 0) {
                userObj.setLeaveDays(userObj.getLeaveDays() - request.getWorkDaysDuration());
                userRepository.save(userObj);
                return ROBundle.getString("successSaveLeave");
            } else {
                return ROBundle.getString("errorSaveLeaveInsufficientLeaveDays");
            }
        }
        return ROBundle.getString("errorSaveLeave");
    }

    public String approveLeave(long leaveId, String approver) {
        Optional<Leave> leave = leaveRepository.findById(leaveId);
        if(leave.isPresent()){
            Leave leaveObj = leave.get();
            leaveObj.setLeaveState(LeaveState.APPROVED);
            if(leaveObj.getApprover() != null) {
                leaveObj.setApprover(approver);
            }
            leaveRepository.save(leaveObj);
            return ROBundle.getString("successApproveLeave");
        }
        return ROBundle.getString("errorApproveLeave");
    }

    public String rejectLeave(long leaveId, String approver) {
        Optional<Leave> leave = leaveRepository.findById(leaveId);
        if(leave.isPresent()){
            Leave leaveObj = leave.get();
            leaveObj.setLeaveState(LeaveState.REJECTED);
            leaveObj.setApprover(approver);
            leaveRepository.save(leaveObj);
            User user = userRepository.findById(leave.get().getOwnerUserId()).get();
            user.setLeaveDays(user.getLeaveDays() + leaveObj.getWorkDaysDuration());
            userRepository.save(user);
            return ROBundle.getString("successRejectLeave");
        }
        return ROBundle.getString("errorRejectLeave");
    }

    public void deleteLeave(long leaveId) {
        Leave leave = leaveRepository.findById(leaveId)
            .orElseThrow(() -> new RuntimeException());
        leaveRepository.delete(leave);
    }
}
