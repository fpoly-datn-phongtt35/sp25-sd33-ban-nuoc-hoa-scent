package com.example.scent.repo;

import com.example.scent.entity.NhomHuong;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
    public interface NhomHuongInterface extends JpaRepository<NhomHuong, Integer> {
    @Query(value = "SELECT CASE WHEN COUNT(*) > 0 THEN 1 ELSE 0 END " +
            "FROM ( " +
            "  SELECT sp.id " +
            "  FROM san_pham sp " +
            "  WHERE sp.id_nhom_huong = :nhomHuongId AND sp.trang_thai = 1 " +
            "  UNION " +
            "  SELECT sp.id " +
            "  FROM san_pham sp " +
            "  INNER JOIN san_pham_mui_huong spmh ON sp.id = spmh.id_san_pham " +
            "  INNER JOIN mui_huong_nhom_huong mhnh ON spmh.id_mui_huong = mhnh.id_mui_huong " +
            "  WHERE mhnh.id_nhom_huong = :nhomHuongId AND sp.trang_thai = 1 " +
            "  UNION " +
            "  SELECT 1 AS id " +
            "  FROM mui_huong_nhom_huong mhnh " +
            "  WHERE mhnh.id_nhom_huong = :nhomHuongId " +
            ") AS linked_records", nativeQuery = true)
    Integer existsSanPhamByNhomHuongId(@Param("nhomHuongId") Integer nhomHuongId);
    }
