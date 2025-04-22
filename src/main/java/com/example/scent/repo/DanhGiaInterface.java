package com.example.scent.repo;

import com.example.scent.entity.DanhGia;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
@Repository
public interface DanhGiaInterface extends JpaRepository<DanhGia,Long> {
    List<DanhGia> findBySanPhamIdSanPham(Integer idSanPham);
    @Query("SELECT d FROM DanhGia d WHERE d.sanPham.idSanPham = :idSanPham ORDER BY d.rating DESC")
    List<DanhGia> findTopRatedBySanPham_IdSanPham(@Param("idSanPham") Integer idSanPham);
    boolean existsBySanPhamIdSanPhamAndTaiKhoanIdAndDonHangId(Integer idSanPham, Integer idTaiKhoan, Integer idDonHang);
    // Kiểm tra xem tài khoản đã đánh giá sản phẩm này chưa
    // Kiểm tra xem tài khoản đã đánh giá sản phẩm này chưa
    Optional<DanhGia> findBySanPhamIdSanPhamAndTaiKhoanIdAndDonHangId(Integer idSanPham, Integer idTaiKhoan, Integer idDonHang);
    boolean existsBySanPhamIdSanPhamAndTaiKhoanId(Integer idSanPham, Integer idTaiKhoan);
}
