package com.example.scent.repo;

import com.example.scent.entity.LichSuTraHang;
import com.example.scent.entity.TraHangNhaSanXuat;
import com.example.scent.entity.YeuCauTraHang;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface YeuCauTraHangInterface extends JpaRepository<YeuCauTraHang, Integer> {
    List<YeuCauTraHang> findByTinhTrangHangAndTaiKhoanDuyetId(String tinhTrangHang, Integer taiKhoanDuyetId);

    //    Integer sumSoLuongByDonHangId(Integer donHangId);
    List<YeuCauTraHang> findByTinhTrangHang(String tinhTrangHang);

    List<YeuCauTraHang> findByTaiKhoanId(Integer idTaiKhoan);

    @Query("SELECT y.id as idYeuCau, y.spct.idSpct, SUM(y.soLuong) as soLuong, y.tinhTrangHang, spct.sanPham.tenSanPham, th.tenThuongHieu, th.id as idThuongHieu, y.lyDoTraHang, " +
            "(SELECT ha.link FROM HinhAnh ha WHERE ha.sanPham.idSanPham = sp.idSanPham ORDER BY ha.id ASC LIMIT 1) as imageUrl ,spct.dungTich,spct.donGia " +
            "FROM YeuCauTraHang y " +
            "JOIN Spct spct ON y.spct.idSpct = spct.idSpct " +
            "JOIN SanPham sp ON spct.sanPham.idSanPham = sp.idSanPham " +
            "JOIN ThuongHieu th ON sp.thuongHieu.id = th.id " +
            "WHERE y.tinhTrangHang = 'HuHong' AND y.trangThai = 3 AND y.soLuong > 0 " +
            "AND (:brand IS NULL OR th.tenThuongHieu = :brand) " +
            "GROUP BY y.id, y.spct.idSpct, y.tinhTrangHang, spct.sanPham.tenSanPham, th.tenThuongHieu, th.id, y.lyDoTraHang, sp.idSanPham,spct.dungTich,spct.donGia")
    Page<Object[]> findDefectiveProductsGroupedBySpct(@Param("brand") String brand, Pageable pageable);
}