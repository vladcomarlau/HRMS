package com.comarlauvlad.hrms.service;

import com.comarlauvlad.hrms.dao.request.SalaryRequest;
import com.comarlauvlad.hrms.entities.Salary;
import com.comarlauvlad.hrms.entities.User;
import com.comarlauvlad.hrms.repository.SalaryRepository;
import com.comarlauvlad.hrms.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
@RequiredArgsConstructor
public class SalaryService {
    @Autowired
    private final SalaryRepository salaryRepository;
    @Autowired
    private UserRepository userRepository;

    public List<Salary> getAllSalaries(){
        return salaryRepository.findAll();
    }

    public List<Map> getAllSalariesUsersData(){
        List<Map> usersMaps = new ArrayList<>();
        for(User user : userRepository.findAll()){
            Map<String, Object> userMap = new HashMap<>();
            userMap.put("id", user.getId());
            userMap.put("firstName", user.getFirstName());
            userMap.put("lastName", user.getLastName());
            userMap.put("email", user.getEmail());
            userMap.put("jobTitle", user.getJobTitle());
            userMap.put("hasSubordinates", !user.getSubordinates().isEmpty());
            if(!user.getSubordinates().isEmpty()){
                userMap.put("subordinatesCount", user.getSubordinates().size());
            }
            if(user.getManager() != null) {
                Map<String, Object> managerMap = new HashMap<>();
                managerMap.put("id", user.getManager().getId());
                managerMap.put("firstName", user.getManager().getFirstName());
                managerMap.put("lastName", user.getManager().getLastName());
                userMap.put("manager", managerMap);
            } else {
                userMap.put("manager", null);
            }
            userMap.put("salaries", user.getSalaries());
            usersMaps.add(userMap);
        }
        return usersMaps;
    }

    public List<Salary> getSalariesByUserId(long userId){
        Optional<User> user = userRepository.findById(userId);
        return user.get().getSalaries();
    }

    public List<Salary> getSalariesByManagerId(long managerId){
        Optional<User> user = userRepository.findById(managerId);
        User manager = user.get();
        List<Salary> salaryList = new ArrayList<>();
        for(User subordinate : manager.getSubordinates()){
            if(subordinate.getSalaries() !=null
                    && !subordinate.getSalaries().isEmpty()){
                salaryList.add(subordinate.getSalaries().get(subordinate.getSalaries().size()-1));
            } else {
                salaryList.add(null);
            }
        }
        return salaryList;
    }

    public Salary getCurrentSalaryByUserId(long userId){
        User userObj = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException());
        return userObj.getSalaries().get(userObj.getSalaries().size()-1);
    }

    public Map<String, Object> getSalaryMapByUserId(long userId){
        Optional<User> user = userRepository.findById(userId);
        return user.get().generateSalary();
    }

    public void saveSalary(SalaryRequest salaryRequest, long userId) {
        if(salaryRequest != null) {
            Optional<User> user = userRepository.findById(userId);
            User userObj = user.get();
            userObj.getSalaries().add(new Salary(salaryRequest));
            userRepository.save(userObj);
        }
    }

    public void deleteSalary(long userId, int salaryIndex) {
        User userObj = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException());
        if(userObj != null
                && userObj.getSalaries() != null
                && salaryIndex >= 0 && salaryIndex < userObj.getSalaries().size()
                && userObj.getSalaries().get(salaryIndex) != null) {
            userObj.getSalaries().remove(salaryIndex);
            userRepository.save(userObj);
        }
    }
}
