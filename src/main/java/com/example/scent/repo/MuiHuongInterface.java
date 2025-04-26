package com.example.scent.repo;

import com.example.scent.entity.MuiHuong;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface MuiHuongInterface extends JpaRepository<MuiHuong, Integer> {
    @Query(value = "SELECT CAST(CASE WHEN COUNT(*) > 0 THEN 1 ELSE 0 END AS BIT) " +
            "FROM ( " +
            "  SELECT id_mui_huong FROM san_pham_mui_huong WHERE id_mui_huong = :muiHuongId " +
            "  UNION " +
            "  SELECT id_mui_huong FROM mui_huong_nhom_huong WHERE id_mui_huong = :muiHuongId " +
            "  /* Thêm các bảng khác nếu cần */ " +
            ") AS linked_tables", nativeQuery = true)
    boolean existsSanPhamByMuiHuongId(@Param("muiHuongId") Integer muiHuongId);
}
