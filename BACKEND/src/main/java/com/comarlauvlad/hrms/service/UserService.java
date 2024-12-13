package com.comarlauvlad.hrms.service;

import com.comarlauvlad.hrms.entities.Role;
import com.comarlauvlad.hrms.entities.User;
import com.comarlauvlad.hrms.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;

import java.util.*;

@Service
@RequiredArgsConstructor
public class UserService {
    private static ResourceBundle ROBundle = ResourceBundle.getBundle("strings");

    @Autowired
    private final UserRepository userRepository;

    @Autowired
    private final JwtService jwtService;

    @Value("${app.hierarchyRootId}")
    private long hierarchyRoot;

    public List<User> getAllUsers() {
        List<User> users = userRepository.findAll();
        for (User user : users) {
            user.setHasSubordinates(!user.getSubordinates().isEmpty());
            user.setSubordinatesCount(user.getSubordinates().size());
            user.countPendingLeaves();
        }
        return users;
    }

    public ArrayList<Map> getAllUsersSearchlist() {
        List<User> users = userRepository.findAll();
        ArrayList<Map> usersList = new ArrayList<>();
        for (User user : users) {
            user.setHasSubordinates(!user.getSubordinates().isEmpty());
            user.setSubordinatesCount(user.getSubordinates().size());
            user.countPendingLeaves();
            Map<String, Object> userMap = new HashMap<>();
            userMap.put("id", user.getId());
            userMap.put("firstName", user.getFirstName());
            userMap.put("lastName", user.getLastName());
            userMap.put("fullName", user.getFullName());
            userMap.put("email", user.getEmail());
            userMap.put("avatar", user.getAvatar());
            userMap.put("jobTitle", user.getJobTitle());
            usersList.add(userMap);
        }
        return usersList;
    }

    public ArrayList<Map> getUsersForReports() {
        List<User> users = userRepository.findAll();
        ArrayList<Map> response = new ArrayList<>();
        for (User user : users) {
            Map<String, Object> userMap = new HashMap<>();
            userMap.put("id", user.getId());
            userMap.put("fullName", user.getFullName());
            userMap.put("seniority", user.getSeniority());
            userMap.put("age", user.getAge());
            if(user.getCurrentEvaluation() != null) {
                userMap.put("currentEvaluationAverage", user.getCurrentEvaluation().getAverage());
            } else {
                userMap.put("currentEvaluationAverage", null);
            }
            response.add(userMap);
        }
        return response;
    }

    public ArrayList<Map> generateOrganigram(long rootId) {
        Optional<User> user = userRepository.findById(rootId);
        ArrayList<Map> subordinates = new ArrayList<>();
        if (user.isPresent()) {
            if(!user.get().getSubordinates().isEmpty()) {
                for(User userSub : user.get().getSubordinates()) {
                    Map<String, Object> subordinate = new HashMap<>();
                    subordinate.put("name", userSub.getFullName());
                    subordinate.put("jobTitle", userSub.getJobTitle());
                    subordinate.put("userId", userSub.getId());
                    if(userSub.getSubordinatesCount()>0) {
                        subordinate.put("children",generateOrganigram(userSub.getId()));
                        subordinate.put("expanded", true);
                    }
                    subordinates.add(subordinate);
                }
            }
        }
        if(rootId==hierarchyRoot) {
            Map<String, Object> result = new HashMap<>();
            result.put("expanded", true);
            result.put("name", user.get().getFullName());
            result.put("jobTitle", user.get().getJobTitle());
            result.put("userId", rootId);
            if(!user.get().getSubordinates().isEmpty()) {
                result.put("children", subordinates);
            }
            ArrayList<Map> resultList = new ArrayList<>();
            resultList.add(result);
            return resultList;
        } else {
            return subordinates;
        }
    }

    public Map<String, Object> getHierarchy(long userId) {
        Optional<User> user = userRepository.findById(userId);
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
                for(User userSubordinate : userObj.getSubordinates()) {
                    Map<String, Object> subordinateMap = new HashMap<>();
                    subordinateMap.put("firstName", userSubordinate.getFirstName());
                    subordinateMap.put("lastName", userSubordinate.getLastName());
                    subordinateMap.put("jobTitle", userSubordinate.getJobTitle());
                    subordinateMap.put("id", userSubordinate.getId());
                    subordinateMap.put("hasSubordinates", !userSubordinate.getSubordinates().isEmpty());
                    subordinateMap.put("subordinatesCount", userSubordinate.getSubordinatesCount());
                    subordinates.add(subordinateMap);
                }
            }
            userMap.put("subordinates", subordinates);
        }
        return userMap;
    }

    public Boolean existsInHierarchy(User manager, User subordinate) {
        boolean subordinateExistsInChain = false;
        User currentPos = manager;
        while(currentPos.getManager() != null) {
            currentPos = currentPos.getManager();
            if (currentPos.getId() == subordinate.getId()) {
                subordinateExistsInChain = true;
                break;
            }
        }
        return subordinateExistsInChain;
    }

    public Map getSalaryPerformanceCorrelation(long userId) {
        Optional<User> user = userRepository.findById(userId);
        Map<String, Object> response = new HashMap<>();
        response.put("recentEvaluations", user.get().getCorrelationElements().get(0));
        response.put("recentSalaries", user.get().getCorrelationElements().get(1));
        response.put("correlationCoefficient", user.get().getSalEvalCorrelation());
        return response;
    }

    public String setTeamManager(long idNewManager, long idOldManager) {
        User newManager = userRepository.findById(idNewManager)
                .orElseThrow(() -> new UsernameNotFoundException(ROBundle.getString("errorUserNotFound")));
        User oldManager = userRepository.findById(idOldManager)
                .orElseThrow(() -> new UsernameNotFoundException(ROBundle.getString("errorUserNotFound")));

        if(newManager == oldManager) {
            return ROBundle.getString("errorSameManager");
        }
        if (oldManager.getSubordinates().contains(newManager)) {
            return ROBundle.getString("errorManagerIsSubordinate");
        }
        if(newManager != null && oldManager != null){
            for(User subordinate : oldManager.getSubordinates()){
                setManager(newManager.getId(), subordinate.getId());
            }
            return ROBundle.getString("successManagerChanged");
        }
        return ROBundle.getString("errorDefault");
    }

    public UserDetailsService userDetailsService() {
        return username -> userRepository.findByEmail(username)
                .orElseThrow(() -> new UsernameNotFoundException(ROBundle.getString("errorUserNotFound")));
    }

    public Optional<User> getUserByEmail(String email) {
        Optional<User> user = userRepository.findByEmail(email);
        user.get().getSubordinatesIDs();
        return user;
    }

    public User getUserById(long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UsernameNotFoundException(ROBundle.getString("errorUserNotFound")));
        if (!user.getSubordinates().isEmpty()){
            List<User> users = user.getSubordinates();
            for (User subordinate : users) {
                subordinate.setHasSubordinates(!subordinate.getSubordinates().isEmpty());
                subordinate.setSubordinatesCount(subordinate.getSubordinates().size());
            }
            user.setHasSubordinates(!user.getSubordinates().isEmpty());
            user.setSubordinatesCount(user.getSubordinates().size());
            user.countPendingLeaves();
            user.getSubordinatesIDs();
        }
        return user;
    }

    public Map<String, Object> getUserByIdSimplified(long userId) {
        User foundUser = userRepository.findById(userId)
                .orElseThrow(() -> new UsernameNotFoundException(ROBundle.getString("errorUserNotFound")));

        Map<String, Object> userMap = new HashMap<>();
        userMap.put("id", foundUser.getId());
        userMap.put("userName", foundUser.getFirstName());
        userMap.put("firstName", foundUser.getFirstName());
        userMap.put("lastName", foundUser.getLastName());
        userMap.put("fullName", foundUser.getFullName());
        userMap.put("email", foundUser.getEmail());
        userMap.put("avatar", foundUser.getAvatar());
        userMap.put("hasSubordinates", foundUser.getSubordinates().isEmpty());
        userMap.put("subordinatesCount", foundUser.getSubordinatesCount());
        userMap.put("jobTitle", foundUser.getJobTitle());
        userMap.put("employmentDate", foundUser.getEmploymentDate());
        userMap.put("phoneNumber", foundUser.getPhoneNumber());
        userMap.put("role", foundUser.getRole());
        userMap.put("subordinatesIDs", foundUser.getSubordinatesIDs());

        if(foundUser.getManager() != null) {
            Map<String, Object> managerMap = new HashMap<>();
            managerMap.put("id", foundUser.getManager().getId());
            managerMap.put("userName", foundUser.getManager().getFirstName());
            managerMap.put("firstName", foundUser.getManager().getFirstName());
            managerMap.put("lastName", foundUser.getManager().getLastName());
            managerMap.put("fullName", foundUser.getManager().getFullName());
            managerMap.put("email", foundUser.getManager().getEmail());
            managerMap.put("avatar", foundUser.getManager().getAvatar());
            managerMap.put("hasSubordinates", foundUser.getSubordinates().isEmpty());
            managerMap.put("subordinatesCount", foundUser.getSubordinatesCount());
            managerMap.put("jobTitle", foundUser.getJobTitle());
            managerMap.put("employmentDate", foundUser.getEmploymentDate());
            managerMap.put("phoneNumber", foundUser.getPhoneNumber());
            managerMap.put("role", foundUser.getRole());
            userMap.put("manager", managerMap);
        }
        return userMap;
    }

    public User getUserByToken(String token) {
        String username = jwtService.extractUserName(token.substring(7));
        User user = getUserByEmail(username)
                .orElseThrow(() -> new UsernameNotFoundException(ROBundle.getString("errorUserNotFound")));
        user.setHasSubordinates(!user.getSubordinates().isEmpty());
        user.getSubordinatesIDs();
        return user;
    }

    public void save(List<User> users) {
        for (User user : users) {
            user.setPassword(new BCryptPasswordEncoder().encode(user.getPassword()));
        }
        userRepository.saveAll(users);
    }

    public String setLeaveDays(long userId, int days) {
        User userObj = userRepository.findById(userId)
                .orElseThrow(() -> new UsernameNotFoundException(ROBundle.getString("errorUserNotFound")));
        if(userObj != null && days >= 0) {
            userObj.setLeaveDays(days);
            userRepository.save(userObj);
            return ROBundle.getString("successModifiedLeaveDays");
        }
        return ROBundle.getString("errorModifiedLeaveDays");
    }

    public User updateUserFields(User user, long id) {
        User userDatabase = userRepository.findById(id).get();
        if(Objects.nonNull(user.getPassword())
                && !"".equalsIgnoreCase(user.getPassword())){
            userDatabase.setPassword(new BCryptPasswordEncoder().encode(user.getPassword()));
        }
        if(Objects.nonNull(user.getFirstName())
                && !"".equalsIgnoreCase(user.getFirstName())){
            userDatabase.setFirstName(user.getFirstName());
        }
        if(Objects.nonNull(user.getLastName())
                && !"".equalsIgnoreCase(user.getLastName())){
            userDatabase.setLastName(user.getLastName());
        }
        if(Objects.nonNull(user.getRole())){
            userDatabase.setRole(user.getRole());
        }
        if(Objects.nonNull(user.getCnp()) && !"".equalsIgnoreCase(user.getCnp())){
            userDatabase.setCnp(user.getCnp());
        }
        if(Objects.nonNull(user.getAddress()) && !"".equalsIgnoreCase(user.getAddress())){
            userDatabase.setAddress(user.getAddress());
        }
        if(Objects.nonNull(user.getPhoneNumber()) && !"".equalsIgnoreCase(user.getPhoneNumber())){
            userDatabase.setPhoneNumber(user.getPhoneNumber());
        }
        if(Objects.nonNull(user.getJobTitle()) && !"".equalsIgnoreCase(user.getJobTitle())){
            userDatabase.setJobTitle(user.getJobTitle());
        }
        if(Objects.nonNull(user.getEmploymentDate()) && !"".equalsIgnoreCase(user.getEmploymentDate())){
            userDatabase.setEmploymentDate(user.getEmploymentDate());
        }
        if(Objects.nonNull(user.getBirthdate()) && !"".equalsIgnoreCase(user.getBirthdate())){
            userDatabase.setBirthdate(user.getBirthdate());
        }
        if(Objects.nonNull(user.getManager())){
            userDatabase.setManager(user.getManager());
        }
        return userRepository.save(userDatabase);
    }

    public User updateUser(String token, User user, long userId) {
        User requestingUser = getUserByEmail(
                jwtService.extractUserName(token.substring(7)))
                .orElseThrow(() -> new UsernameNotFoundException(ROBundle.getString("errorUserNotFound")));
        if (requestingUser != null && requestingUser.getRole() == Role.ADMIN) {
            if(user != null) {
                return updateUserFields(user, userId);
            }
        } else if (user != null && requestingUser.getId() == userId) {
            return updateUserFields(user, userId);
        }
        return null;
    }

    public String deleteUserById(long userId) {
        User userObj = userRepository.findById(userId)
                .orElseThrow(() -> new UsernameNotFoundException(ROBundle.getString("errorUserNotFound")));
        userRepository.delete(userObj);
        return ROBundle.getString("successUserDeleted");
    }

    public String deleteFromTeam(long idManager, long idSubordinate) {
        User manager = userRepository.findById(idManager)
                .orElseThrow(() -> new UsernameNotFoundException(ROBundle.getString("errorUserNotFound")));
        User subordinate = userRepository.findById(idSubordinate)
                .orElseThrow(() -> new UsernameNotFoundException(ROBundle.getString("errorUserNotFound")));
        if(subordinate != null && manager != null){
            if(manager.getSubordinates().contains(subordinate)) {
                manager.getSubordinates().remove(subordinate);
            }
            subordinate.setManager(null);
            userRepository.save(subordinate);
            userRepository.save(manager);
            return ROBundle.getString("successDeleteSubordinate");
        }
        return ROBundle.getString("errorDefault");
    }

    public boolean userHasSubordinates(long id) {
        User userObj = userRepository.findById(id)
                .orElseThrow(() -> new UsernameNotFoundException(ROBundle.getString("errorUserNotFound")));
        return !userObj.getSubordinates().isEmpty();
    }

    public String setManager(long idManager, long idSubordinate) {
        User subordinate = getUserById(idSubordinate);
        User manager = getUserById(idManager);
        if(subordinate != null && manager != null){
            if(subordinate == manager) {
                return ROBundle.getString("errorManagerIsSubordinateExplicit");
            }
            if (subordinate.getSubordinates().contains(manager)) {
                return ROBundle.getString("errorManagerCannotBeUnderSubordinate");
            }
            if (manager.getSubordinates().contains(subordinate)) {
                return ROBundle.getString("errorUserAlreadyInTeam");
            }
            if (existsInHierarchy(manager, subordinate)) {
                return ROBundle.getString("errorManagerIsAlreadyInHierarchy");
            }
            subordinate.setManager(manager);
            userRepository.save(subordinate);
            return ROBundle.getString("successSetManager1") + idSubordinate + " "
                    + ROBundle.getString("successSetManager2") + " " + idManager;
        }
        return ROBundle.getString("successSetManager");
    }

    public boolean isAdminOrManagerByJWT(String token) {
        User user = getUserByToken(token);
        return user.getRole() == Role.ADMIN || user.getRole() == Role.MANAGER;
    }

    public boolean isSameJWTandID(String token, long id) {
        User user = getUserByToken(token);
        return user.getId() == id;
    }
}
