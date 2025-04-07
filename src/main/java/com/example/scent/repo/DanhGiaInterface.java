package com.example.scent.repo;

import com.example.scent.entity.DanhGia;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DanhGiaInterface extends JpaRepository<DanhGia,Long> {
    List<DanhGia> findBySanPhamIdSanPham(Integer idSanPham);

    // Kiểm tra xem tài khoản đã đánh giá sản phẩm này chưa
    boolean existsBySanPhamIdSanPhamAndTaiKhoanId(Integer idSanPham, Integer idTaiKhoan);
}
