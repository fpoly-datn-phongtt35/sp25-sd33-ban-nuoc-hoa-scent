package com.example.scent.repo;

import com.example.scent.entity.NhomHuong;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
    public interface NhomHuongInterface extends JpaRepository<NhomHuong, Integer> {
    @Query(value = "SELECT CASE " +
            "WHEN EXISTS (" +
            "    SELECT 1 " +
            "    FROM san_pham sp " +
            "    WHERE sp.id_nhom_huong = :nhomHuongId" +
            ") THEN 1 " +
            "ELSE 0 " +
            "END", nativeQuery = true)
    Integer existsSanPhamByNhomHuongId(Integer nhomHuongId);
    }
