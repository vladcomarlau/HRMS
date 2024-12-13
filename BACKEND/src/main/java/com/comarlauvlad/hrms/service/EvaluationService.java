package com.comarlauvlad.hrms.service;

import com.comarlauvlad.hrms.dao.request.EvaluationRequest;
import com.comarlauvlad.hrms.entities.Evaluation;
import com.comarlauvlad.hrms.entities.User;
import com.comarlauvlad.hrms.repository.EvaluationRepository;
import com.comarlauvlad.hrms.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
@RequiredArgsConstructor
public class EvaluationService {

    private static ResourceBundle ROBundle = ResourceBundle.getBundle("strings");

    @Autowired
    private final EvaluationRepository evaluationRepository;

    @Autowired
    private final UserRepository userRepository;

    public List<Evaluation> getUserEvaluations(long userId) {
        Optional<User> user = userRepository.findById(userId);
        return user.get().getEvaluations();
    }

    public List<Evaluation> getAllEvaluations() {
        return evaluationRepository.findAll();
    }

    public Map<String, Object> getTeamPerformance(long managerId) {
        Optional<User> user = userRepository.findById(managerId);
        Map<String, Object> userMap = new HashMap<>();
        if (user.isPresent()) {
            User userObj = user.get();
            userMap.put("firstName", userObj.getFirstName());
            userMap.put("id", userObj.getId());
            userMap.put("lastName", userObj.getLastName());
            userMap.put("subordinatesCount", userObj.getSubordinatesCount());
            userMap.put("hasSubordinates", !userObj.getSubordinates().isEmpty());

            User userMan =  userObj.getManager();
            if(userMan != null) {
                Map<String, Object> managerMap = new HashMap<>();
                managerMap.put("id", userMan.getId());
                managerMap.put("firstName", userMan.getFirstName());
                managerMap.put("lastName", userMan.getLastName());
                managerMap.put("hasSubordinates", !userMan.getSubordinates().isEmpty());
                managerMap.put("subordinatesCount", userMan.getSubordinatesCount());
                userMap.put("manager", managerMap);
            } else {
                userMap.put("manager", null);
            }

            ArrayList<Map> subordinates = new ArrayList<>();
            if(!userObj.getSubordinates().isEmpty()) {
                for(User subordinate : userObj.getSubordinates()) {
                    Map<String, Object> subordinateMap = new HashMap<>();
                    subordinateMap.put("firstName", subordinate.getFirstName());
                    subordinateMap.put("lastName", subordinate.getLastName());
                    subordinateMap.put("jobTitle", subordinate.getJobTitle());
                    subordinateMap.put("id", subordinate.getId());
                    subordinateMap.put("hasSubordinates", !subordinate.getSubordinates().isEmpty());
                    subordinateMap.put("subordinatesCount", subordinate.getSubordinatesCount());
                    subordinateMap.put("currentEvaluation", subordinate.getCurrentEvaluation());
                    subordinates.add(subordinateMap);
                }
            }
            userMap.put("subordinates", subordinates);
        }
        return userMap;
    }

    public Map<String, Object> getAllTeamsPerformance(boolean isAdminOrManager) {
        Map<String, Object> response = new HashMap<>();
        ArrayList<Map> managers = new ArrayList<>();

        for (User manager : userRepository.getAllManagerUsers()) {
            Map<String, Object> managerMap = new HashMap<>();
            managerMap.put("id", manager.getId());
            managerMap.put("firstName", manager.getFirstName());
            managerMap.put("lastName", manager.getLastName());
            managerMap.put("subordinatesCount", manager.getSubordinatesCount());

            float evaluationAveragesTotal = 0.0f;
            int countEvaluatedSubordinates = 0;
            for (User subordinate : manager.getSubordinates()) {
                if(subordinate.getCurrentEvaluation() != null) {
                    evaluationAveragesTotal += subordinate.getCurrentEvaluation().getAverage();
                    countEvaluatedSubordinates++;
                }
            }
            if(!manager.getSubordinates().isEmpty()) {
                evaluationAveragesTotal /= countEvaluatedSubordinates;
            }
            if(isAdminOrManager) {
                managerMap.put("evaluationsAverage",evaluationAveragesTotal);
            }
            managers.add(managerMap);
        }
        response.put("teams", managers);

        if(isAdminOrManager) {
            //minMax[0] = min; minMax[1] = max
            ArrayList<Long> minMaxId = new ArrayList<>();
            ArrayList<Float> minMaxAverages = new ArrayList<>();

            if(!managers.isEmpty()) {
                for (int i = 0; i < 2; i++) {
                    minMaxId.add((Long) managers.get(0).get("id"));
                    minMaxAverages.add((Float) managers.get(0).get("evaluationsAverage"));
                }

                for(Map manager : managers) {
                    if(minMaxAverages.get(0) > (Float) manager.get("evaluationsAverage")) {
                        minMaxId.set(0, (Long) manager.get("id"));
                        minMaxAverages.set(0, (Float) manager.get("evaluationsAverage"));
                    }
                    if(minMaxAverages.get(1) < (Float) manager.get("evaluationsAverage")) {
                        minMaxId.set(1, (Long) manager.get("id"));
                        minMaxAverages.set(1, (Float) manager.get("evaluationsAverage"));
                    }
                }

                if(isAdminOrManager) {
                    response.put("teamMinId", minMaxId.get(0));
                    response.put("teamMinAverage", minMaxAverages.get(0));
                    response.put("teamMaxId", minMaxId.get(1));
                    response.put("teamMaxAverage", minMaxAverages.get(1));
                }
            } else {
                if(isAdminOrManager) {
                    response.put("teamMinId", null);
                    response.put("teamMinAverage", null);
                    response.put("teamMaxId", null);
                    response.put("teamMaxAverage", null);
                }
            }
        }
        return response;
    }

    public List<Evaluation> getAllCurrentEvaluations() {
        List<Evaluation> currentEvaluations = new ArrayList<>();
        List<User> users = userRepository.findAll();
        for (User user : users) {
            if(!user.getEvaluations().isEmpty()) {
                currentEvaluations.add(user.getCurrentEvaluation());
            }
        }
        return currentEvaluations;
    }

    public ArrayList<Map> getEvaluationsAccounts() {
        List<User> users = userRepository.findAll();
        ArrayList<Map> accounts = new ArrayList<>();
        for(User user : users) {
            Map<String, Object> userMap = new HashMap<>();
            userMap.put("id", user.getId());
            userMap.put("firstName", user.getFirstName());
            userMap.put("lastName", user.getLastName());
            userMap.put("email", user.getEmail());
            userMap.put("jobTitle", user.getJobTitle());
            userMap.put("fullName", user.getFullName());
            if(user.getCurrentEvaluation() != null) {
                userMap.put("currentEvaluation", user.getCurrentEvaluation());
            } else {
                userMap.put("currentEvaluation", null);
            }
            accounts.add(userMap);
        }
        return accounts;
    }

    public String saveEvaluation(EvaluationRequest request, long userId) {
        if(request != null) {
            Optional<User> user = userRepository.findById(userId);
            User userObj = user.get();
            userObj.getEvaluations().add(new Evaluation(request));
            Collections.sort(userObj.getEvaluations());

            userRepository.save(userObj);
            return ROBundle.getString("successSaveEvaluation");
        }
        return ROBundle.getString("errorSaveEvaluation");
    }

    public String deleteEvaluationById(long userId, long evaluationId) {
        User userObj = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException());
        if(userObj.getEvaluations() != null) {
            Evaluation evaluationToBeRemoved = evaluationRepository.findById(evaluationId)
                    .orElseThrow(() -> new RuntimeException());
            userObj.getEvaluations().remove(evaluationToBeRemoved);
            userRepository.save(userObj);
            evaluationRepository.deleteById(evaluationId);
            return ROBundle.getString("successDeleteEvaluations");
        }
        return ROBundle.getString("errorDeleteEvaluation");
    }
}
