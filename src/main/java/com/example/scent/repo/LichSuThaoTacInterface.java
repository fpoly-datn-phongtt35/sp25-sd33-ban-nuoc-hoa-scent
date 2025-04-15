package com.example.scent.repo;

import com.example.scent.entity.LichSuThaoTac;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
@Repository
public interface LichSuThaoTacInterface extends JpaRepository<LichSuThaoTac,Integer> {
    List<LichSuThaoTac> findByMaDonHang(Integer maDonHang);
    List<LichSuThaoTac> findByTaiKhoanId(Integer taiKhoanId);
    List<LichSuThaoTac> findAll();
    List<LichSuThaoTac> findByMaDonHangOrderByThoiGianThaoTacDesc(Integer maDonHang);
}
