package com.comarlauvlad.hrms.entities;

import java.time.LocalDate;
import java.time.Period;
import java.util.*;

import com.comarlauvlad.hrms.adnotations.ToLowerCase;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonIncludeProperties;
import lombok.*;
import org.apache.commons.math3.stat.correlation.PearsonsCorrelation;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import jakarta.persistence.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "_user")
public class User implements UserDetails {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private Date createdAt;

    @LastModifiedDate
    @Column(name = "updated_at", nullable = false)
    private Date updatedAt;

    private String firstName;
    private String lastName;

    @Column(unique = true)
    @ToLowerCase
    private String email;
    private String password;

    @Enumerated(EnumType.STRING)
    private Role role;
    private String address;
    private String cnp;
    private String phoneNumber;
    private String jobTitle;
    private String birthdate;
    private String employmentDate;

    private Integer age;
    private Integer seniority;

    @Getter
    @JsonIgnore
    @OneToMany(cascade = CascadeType.ALL)
    private List<Salary> salaries = new ArrayList<>();

    @JsonIgnore
    @OneToMany(cascade = CascadeType.ALL)
    private List<Evaluation> evaluations = new ArrayList<>();

    @ManyToOne
    @JoinColumn(name = "manager_id")
    @JsonIncludeProperties({"id", "firstName", "lastName", "avatar", "jobTitle", "hasSubordinates", "subordinatesCount"})
    private User manager;

    private boolean hasSubordinates = false;

    @Transient
    private ArrayList<Long> subordinateIDs = new ArrayList<>();

    @OneToMany
    @JoinColumn(name = "subordinates")
    @JsonIncludeProperties({"id", "firstName", "lastName", "avatar", "jobTitle", "hasSubordinates", "subordinatesCount", "salaries", "currentEvaluation"})
    @JsonIgnore
    private List<User> subordinates = new ArrayList<>();

    private int subordinatesCount = 0;

    @OneToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "avatar_id")
    @JsonIgnoreProperties({"data", "type", "name"})
    private Avatar avatar;

    @OneToMany(cascade = CascadeType.ALL)
    @JoinColumn(name = "leaves")
    @JsonIgnoreProperties({"data", "type", "name"})
    @JsonIgnore
    private List<Leave> leaves = new ArrayList<>();

    private int leaveDays = 30;
    private int countPendingLeaves = 0;

    @PrePersist
    protected void onCreate() {
        createdAt = new Date();
        updatedAt = new Date();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = new Date();
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority(role.name()));
    }

    @Override
    public String getUsername() {
        return email;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }

    public User setManager(User manager) {
        this.manager = manager;
        if (manager != null) {
            manager.getSubordinates().add(this);
        }
        return this;
    }

    public int getSubordinatesCount() {
        this.subordinatesCount = subordinates.size();
        return subordinatesCount;
    }

    public ArrayList<Long> getSubordinatesIDs() {
        if (!this.subordinates.isEmpty()) {
            for(User subordinate : this.subordinates) {
                this.subordinateIDs.add(subordinate.getId());
            }
        }
        return this.subordinateIDs;
    }

    public String getFullName() {
        return firstName + " " + lastName;
    }

    public void addSalary(Salary salary) {
        this.salaries.add(salary);
    }

    public Map<String, Object> generateSalary() {
        Map<String, Object> salariesMap = new HashMap<>();

        Collections.sort(this.salaries);
        List<Salary> salaries = this.salaries;

        List<LocalDate> dates = new ArrayList<>();
        List<Integer> base = new ArrayList<>();
        List<Integer> performanceBonuses = new ArrayList<>();
        List<Integer> projectBonuses = new ArrayList<>();
        List<Integer> mealTickets = new ArrayList<>();
        List<Integer> lifeInsurances = new ArrayList<>();
        List<Integer> subscriptions = new ArrayList<>();
        List<Integer> totals = new ArrayList<>();

        for (Salary salary : salaries) {
            dates.add(salary.getDate());
            base.add(salary.getBase());
            performanceBonuses.add(salary.getPerformanceBonus());
            projectBonuses.add(salary.getProjectBonus());
            mealTickets.add(salary.getMealTickets());
            lifeInsurances.add(salary.getLifeInsurance());
            subscriptions.add(salary.getSubscriptions());
            totals.add(salary.getTotal());
        }

        List<List> values = Arrays.asList(
                performanceBonuses,
                projectBonuses,
                mealTickets,
                lifeInsurances,
                base,
                subscriptions,
                totals);

        List<String> valueLabel =
            Arrays.asList(
                    "Bonus de performanta",
                    "Bonus de proiecte",
                    "Bonuri de masa",
                    "Asigurare de viata",
                    "Salariul de baza",
                    "Beneficii",
                    "Total");
        List<Map> dataSets = new ArrayList<>();
        List<Boolean> fill = Arrays.asList(false, false, false, false, true, false, false);

        for(List value : values) {
            Map<String,Object> mapDataSet = new HashMap<>();
            mapDataSet.put("data", value);
            mapDataSet.put("tension", .0);
            mapDataSet.put("fill", fill.get(values.indexOf(value)));
            mapDataSet.put("label", valueLabel.get(values.indexOf(value)));
            dataSets.add(mapDataSet);
        }

        salariesMap.put("datasets", dataSets);
        salariesMap.put("labels", dates);
        return salariesMap;
    }

    @JsonIgnore
    public Evaluation getCurrentEvaluation() {
        Collections.sort(this.evaluations);
        if(this.evaluations != null && !this.evaluations.isEmpty()) {
            return this.evaluations.get(this.evaluations.size() - 1);
        } else {
            return null;
        }
    }

    @JsonIgnore
    public List<List> getCorrelationElements() {
        Collections.sort(this.evaluations);
        Collections.sort(this.salaries);

        int sizeDifference = Math.abs(this.evaluations.size() - this.salaries.size());
        List<List> series = Arrays.asList(this.evaluations, this.salaries);
        List<Integer> sizes = Arrays.asList(this.evaluations.size(), this.salaries.size());

        series.set(sizes.indexOf(Collections.max(sizes)),
               series.get(sizes.indexOf(Collections.max(sizes))).subList(sizeDifference,
                       series.get(sizes.indexOf(Collections.max(sizes))).size()));

       return Arrays.asList(series.get(0), series.get(1));
    }

    public double getSalEvalCorrelation() {
        List<Evaluation> evaluations = getCorrelationElements().get(0);
        List<Salary> salaries = getCorrelationElements().get(1);
        double[] recentEvaluations = new double[evaluations.size()];
        double[] recentSalaries = new double[salaries.size()];

        if(evaluations.size() > 1 && !salaries.isEmpty()) {
            int index = 0;
            for (Evaluation e : evaluations) {
                recentEvaluations[index] = e.getAverage();
                index++;
            }
            index = 0;
            for (Salary s : salaries) {
                recentSalaries[index] = s.getTotal();
                index++;
            }
            return new PearsonsCorrelation().correlation(recentEvaluations, recentSalaries);
        }
        return 0.0;
    }

    public void calculateAge() {
        if (this.birthdate != null) {
            this.setAge(Period.between(LocalDate.parse(this.birthdate), LocalDate.now()).getYears());
        } else {
            this.setAge(0);
        }
    }

    public void calculateSeniority() {
        if (this.employmentDate != null) {
            this.setSeniority(Period.between(LocalDate.parse(this.employmentDate), LocalDate.now()).getYears());
        } else {
            this.setSeniority(0);
        }
    }

    public int getAge() {
        calculateAge();
        return this.age;
    }

    public int getSeniority() {
        calculateSeniority();
        return this.seniority;
    }

    public void countPendingLeaves() {
        int count = 0;
        for(int i = 0; i < this.getLeaves().size(); i++) {
            if(this.leaves.get(i).getLeaveState() == LeaveState.PENDING) {
                count++;
            }
        }
        this.countPendingLeaves = count;
    }

    public int getCountPendingLeaves() {
        this.countPendingLeaves();
        return this.countPendingLeaves;
    }
}
