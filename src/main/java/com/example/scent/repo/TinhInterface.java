package com.example.scent.repo;

import com.example.scent.entity.tinh;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface TinhInterface extends JpaRepository<tinh, Integer> {
    Optional<tinh> findByMaTinh(Integer maTinh);
}
