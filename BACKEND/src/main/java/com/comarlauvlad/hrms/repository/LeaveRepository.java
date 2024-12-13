package com.comarlauvlad.hrms.repository;

import com.comarlauvlad.hrms.entities.Leave;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import java.util.ArrayList;

@Repository
public interface LeaveRepository extends CrudRepository<Leave, Long>{
    ArrayList<Leave> findAll();
}
