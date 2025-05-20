package com.example.scent.repo;

import com.example.scent.entity.LichSuTraHang;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface LichSuTraHangInterface extends JpaRepository<LichSuTraHang, Integer> {
    @Query("SELECT ls FROM LichSuTraHang ls WHERE ls.yeuCauTraHang.id = :idYeuCau")
    List<LichSuTraHang> findByYeuCauTraHangId(@Param("idYeuCau") Integer idYeuCau);

    @Query("SELECT l FROM LichSuTraHang l WHERE l.yeuCauTraHang.id = :yeuCauId AND l.thaoTac = 2 ORDER BY l.thoiGianThaoTac DESC")
    Optional<LichSuTraHang> findLatestRejectionByYeuCauId(Integer yeuCauId);
}
