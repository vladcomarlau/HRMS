package com.comarlauvlad.hrms.repository;

import com.comarlauvlad.hrms.entities.PublicHoliday;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.ArrayList;

@Repository
public interface PublicHolidayRepository extends CrudRepository<PublicHoliday, LocalDate>{
    ArrayList<PublicHoliday> findAll();
}
