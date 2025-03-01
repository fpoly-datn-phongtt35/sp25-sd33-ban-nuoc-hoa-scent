package com.example.scent.repo;

import com.example.scent.entity.DanhGiaDichVu;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository

public interface DanhGiaDichVuInterface extends JpaRepository<DanhGiaDichVu, Integer> {
}
