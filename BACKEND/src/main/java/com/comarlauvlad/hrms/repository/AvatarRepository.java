package com.comarlauvlad.hrms.repository;

import com.comarlauvlad.hrms.entities.Avatar;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import java.util.ArrayList;

@Repository
public interface AvatarRepository extends CrudRepository<Avatar,String>{
    ArrayList<Avatar> findAll();
}
