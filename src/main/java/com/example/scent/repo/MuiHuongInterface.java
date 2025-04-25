package com.example.scent.repo;

import com.example.scent.entity.MuiHuong;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface MuiHuongInterface extends JpaRepository<MuiHuong, Integer> {
    @Query(value = "SELECT CASE WHEN COUNT(spmh) > 0 THEN 1 ELSE 0 END " +
            "FROM san_pham_mui_huong spmh " +
            "INNER JOIN mui_huong_nhom_huong mhnh ON spmh.id_mui_huong = mhnh.id_mui_huong " +
            "WHERE spmh.id_mui_huong = :muiHuongId", nativeQuery = true)
    boolean existsSanPhamByMuiHuongId(@Param("muiHuongId") Integer muiHuongId);
}
