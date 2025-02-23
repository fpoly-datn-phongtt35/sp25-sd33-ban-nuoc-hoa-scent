package com.example.scent.repo;

import com.example.scent.entity.TaiKhoan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface TaiKhoanInterface extends JpaRepository<TaiKhoan, Integer>{
//    @Query("SELECT tk FROM TaiKhoan tk WHERE tk.tenDangNhap = :tenDangNhap")
//    TaiKhoan findByUsername(@Param("tenDangNhap") String tenDangNhap);
//    @Query("SELECT tk.vaiTro FROM TaiKhoan tk WHERE tk.tenDangNhap = :tenDangNhap")
//    String getRole(@Param("tenDangNhap") String tenDangNhap);
    @Query(value = "select * from tai_khoan where ten_dang_nhap = :tenDangNhap", nativeQuery = true)
    TaiKhoan findByUsername(@Param("tenDangNhap") String tenDangNhap);
    @Query(value = "select vai_tro from tai_khoan where ten_dang_nhap = :tenDangNhap", nativeQuery = true)
    String getRole(@Param("tenDangNhap") String tenDangNhap);

    Optional<TaiKhoan> findByTenDangNhap(String tenDangNhap);

}
