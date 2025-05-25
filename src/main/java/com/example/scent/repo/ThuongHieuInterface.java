package com.example.scent.repo;

import com.example.scent.entity.ThuongHieu;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository

public interface ThuongHieuInterface extends JpaRepository<ThuongHieu, Integer> {
    boolean existsByTenThuongHieuIgnoreCase(String tenThuongHieu);
    @Query("SELECT EXISTS (SELECT 1 FROM SanPham sp WHERE sp.thuongHieu.id = :thuongHieuId)")
    boolean existsSanPhamByThuongHieuId(Integer thuongHieuId);
    @Query("SELECT th FROM ThuongHieu th " +
            "WHERE (:searchQuery IS NULL OR :searchQuery = '' " +
            "OR LOWER(th.tenThuongHieu) LIKE LOWER(CONCAT('%', :searchQuery, '%')) " +
            "OR LOWER(th.quocGia) LIKE LOWER(CONCAT('%', :searchQuery, '%')) " +
            "OR LOWER(th.moTa) LIKE LOWER(CONCAT('%', :searchQuery, '%')))")
    Page<ThuongHieu> searchByMultipleFields(@Param("searchQuery") String searchQuery, Pageable pageable);
    @Query("SELECT COUNT(sp) FROM SanPham sp WHERE sp.thuongHieu.id = :thuongHieuId")
    Long countSanPhamByThuongHieuId(Integer thuongHieuId);
    // Kiểm tra xem có sản phẩm nào đang hoạt động (trang_thai = 1) không
    @Query("SELECT COUNT(sp) > 0 FROM SanPham sp WHERE sp.thuongHieu.id = :thuongHieuId AND sp.trangThai = 1")
    boolean existsSanPhamActiveByThuongHieuId(@Param("thuongHieuId") Integer thuongHieuId);

    // Kiểm tra xem có sản phẩm nào ngừng bán (trang_thai = 0) không
    @Query("SELECT COUNT(sp) > 0 FROM SanPham sp WHERE sp.thuongHieu.id = :thuongHieuId AND sp.trangThai = 0")
    boolean existsSanPhamInactiveByThuongHieuId(@Param("thuongHieuId") Integer thuongHieuId);

    // Kiểm tra xem tất cả sản phẩm của thương hiệu có trang_thai = 0 không
    @Query("SELECT CASE " +
            "WHEN (SELECT COUNT(sp) FROM SanPham sp WHERE sp.thuongHieu.id = :thuongHieuId) = 0 THEN true " +
            "WHEN (SELECT COUNT(sp) FROM SanPham sp WHERE sp.thuongHieu.id = :thuongHieuId AND sp.trangThai = 1) = 0 THEN true " +
            "ELSE false END")
    boolean areAllSanPhamInactiveByThuongHieuId(@Param("thuongHieuId") Integer thuongHieuId);
}

