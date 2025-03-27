package com.example.scent.repo;

import com.example.scent.entity.quan;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface QuanInterface extends JpaRepository<quan, Integer> {
    Optional<quan> findByMaQuan(Integer maQuan);
}
