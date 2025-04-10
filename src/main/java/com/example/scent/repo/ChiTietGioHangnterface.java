package com.example.scent.repo;

import com.example.scent.entity.ChiTietGioHang;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChiTietGioHangnterface extends JpaRepository<ChiTietGioHang, Integer> {
    List<ChiTietGioHang> findByGioHangId(Integer gioHangId);
    ChiTietGioHang findByGioHangIdAndSpctIdSpct(Integer gioHangId, Integer spctId);

    // Thêm truy vấn để lấy ChiTietGioHang dựa trên idTaiKhoan
    @Query("SELECT ct FROM ChiTietGioHang ct WHERE ct.gioHang.idTaiKhoan = :idTaiKhoan")
    List<ChiTietGioHang> findByGioHangIdTaiKhoan(@Param("idTaiKhoan") Integer idTaiKhoan);
    List<ChiTietGioHang> findByGioHangIdAndSpctIdSpctIn(Integer gioHangId, List<Integer> spctIds);
}