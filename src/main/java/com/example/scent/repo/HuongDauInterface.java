package com.example.scent.repo;

import com.example.scent.entity.HuongDau;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository

public interface HuongDauInterface extends JpaRepository<HuongDau, Integer>{
    void removeById(Integer id);
}
