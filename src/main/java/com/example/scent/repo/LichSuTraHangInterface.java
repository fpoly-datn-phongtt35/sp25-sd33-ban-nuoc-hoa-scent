package com.example.scent.repo;

import com.example.scent.entity.LichSuTraHang;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface LichSuTraHangInterface extends JpaRepository<LichSuTraHang, Integer> {
    @Query("SELECT ls FROM LichSuTraHang ls WHERE ls.yeuCauTraHang.id = :idYeuCau")
    List<LichSuTraHang> findByYeuCauTraHangId(@Param("idYeuCau") Integer idYeuCau);
}
