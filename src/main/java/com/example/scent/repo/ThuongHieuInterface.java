package com.example.scent.repo;

import com.example.scent.entity.ThuongHieu;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository

public interface ThuongHieuInterface extends JpaRepository<ThuongHieu, Integer> {
    boolean existsByTenThuongHieuIgnoreCase(String tenThuongHieu);
}

