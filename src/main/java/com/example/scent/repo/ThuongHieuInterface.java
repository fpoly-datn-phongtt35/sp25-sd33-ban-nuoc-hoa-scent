package com.example.scent.repo;

import com.example.scent.entity.ThuongHieu;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository

public interface ThuongHieuInterface extends JpaRepository<ThuongHieu, Integer> {
    boolean existsByTenThuongHieuIgnoreCase(String tenThuongHieu);
    @Query("SELECT EXISTS (SELECT 1 FROM SanPham sp WHERE sp.thuongHieu.id = :thuongHieuId)")
    boolean existsSanPhamByThuongHieuId(Integer thuongHieuId);
}

