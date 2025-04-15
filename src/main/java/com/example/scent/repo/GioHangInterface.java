package com.example.scent.repo;

import com.example.scent.entity.GioHang;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface GioHangInterface extends JpaRepository<GioHang,Integer> {
    GioHang findByIdTaiKhoanAndTrangThai(Integer idTaiKhoan, Integer trangThai);
}
