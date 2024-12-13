package com.comarlauvlad.hrms.repository;

import com.comarlauvlad.hrms.entities.Evaluation;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import java.util.ArrayList;

@Repository
public interface EvaluationRepository extends CrudRepository<Evaluation, Long>{
    ArrayList<Evaluation> findAll();
}
