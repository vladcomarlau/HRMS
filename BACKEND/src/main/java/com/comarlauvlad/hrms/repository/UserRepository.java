package com.comarlauvlad.hrms.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.comarlauvlad.hrms.entities.User;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    @Query(
        value = "SELECT * FROM \"_USER\" " +
                "WHERE ID IN (" +
                    "SELECT MANAGER_ID FROM \"_USER\")",
        nativeQuery = true)
    List<User> getAllManagerUsers();
}
