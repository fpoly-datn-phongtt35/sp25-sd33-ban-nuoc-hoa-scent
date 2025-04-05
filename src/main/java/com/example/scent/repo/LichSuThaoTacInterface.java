package com.example.scent.repo;

import com.example.scent.entity.LichSuThaoTac;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface LichSuThaoTacInterface extends JpaRepository<LichSuThaoTac,Integer> {
    List<LichSuThaoTac> findByMaDonHang(Integer maDonHang);
    List<LichSuThaoTac> findByTaiKhoanId(Integer taiKhoanId);
    List<LichSuThaoTac> findAll();
    List<LichSuThaoTac> findByMaDonHangOrderByThoiGianThaoTacDesc(Integer maDonHang);
}
