package com.comarlauvlad.hrms.repository;

import com.comarlauvlad.hrms.entities.Salary;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import java.util.ArrayList;

@Repository
public interface SalaryRepository extends CrudRepository<Salary, Long>{
    ArrayList<Salary> findAll();
}
