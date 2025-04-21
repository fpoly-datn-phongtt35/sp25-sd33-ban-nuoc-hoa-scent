package com.example.scent.repo;

import com.example.scent.entity.PhongCach;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface PhongCachInterface extends JpaRepository<PhongCach, Integer> {
    @Query("SELECT COUNT(sp) > 0 FROM SanPham sp JOIN sp.phongCachs pc WHERE pc.id = :phongCachId")
    boolean existsSanPhamByPhongCachId(Integer phongCachId);
}
