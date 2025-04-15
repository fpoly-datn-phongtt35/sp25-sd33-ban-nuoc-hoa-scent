package com.example.scent.repo;

import com.example.scent.entity.PhongCach;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PhongCachInterface extends JpaRepository<PhongCach, Integer> {
}
