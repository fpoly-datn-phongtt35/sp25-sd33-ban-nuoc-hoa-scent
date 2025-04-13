package com.example.scent.repo;

import com.example.scent.entity.TaiKhoan;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
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
    @Query("SELECT u FROM TaiKhoan u " +
            "WHERE u.hoTen LIKE %:searchTerm% " +
            "OR u.email LIKE %:searchTerm% " +
            "OR u.sdt LIKE %:searchTerm% " +
            "OR u.tenDangNhap LIKE %:searchTerm%")
    Page<TaiKhoan> findBySearchTerm(@Param("searchTerm") String searchTerm, Pageable pageable);
    @Query("SELECT tk FROM TaiKhoan tk " +
            "WHERE tk.vaiTro = :role " +
            "AND (LOWER(tk.hoTen) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
            "     OR LOWER(tk.email) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
            "     OR LOWER(tk.tenDangNhap) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
            "     OR LOWER(tk.sdt) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    Page<TaiKhoan> searchByRoleAndKeyword(
            @Param("role") String role,
            @Param("keyword") String keyword,
            Pageable pageable);
    Optional<TaiKhoan> findByEmail(String email);
    Optional<TaiKhoan> findBySdt(String sdt);
    @Query("SELECT tk FROM TaiKhoan tk WHERE tk.id = :id")
    TaiKhoan findByIdTk(@Param("id") Integer id);
}
