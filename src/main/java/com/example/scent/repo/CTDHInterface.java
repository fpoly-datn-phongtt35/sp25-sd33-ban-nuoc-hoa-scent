package com.example.scent.repo;

import com.example.scent.dto.BestSellingSanPhamInfoDTO;
import com.example.scent.entity.ChiTietDonHang;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CTDHInterface extends JpaRepository<ChiTietDonHang, Integer> {
    @Query("SELECT c FROM ChiTietDonHang c WHERE c.id = :idDonHang AND c.spct.idSpct = :idSpct")
    Optional<ChiTietDonHang> findByIdDonHangAndIdSpct(@Param("idDonHang") Integer idDonHang, @Param("idSpct") Integer idSpct);

    List<ChiTietDonHang> findByDonHangId(Integer donHangId);

    List<ChiTietDonHang> findBySpctSanPhamIdSanPham(Integer idSanPham);

    @Query(value = "SELECT sp.id AS id_san_pham, sp.ten AS ten_san_pham, sp.mo_ta AS mo_ta_san_pham, " +
            "th.ten_thuong_hieu AS thuong_hieu, nh.ten_nhom AS nhom_huong, dm.ten_danh_muc AS danh_muc, " +
            "hd.mota AS huong_dau, hg.mota AS huong_giua, hc.mota AS huong_cuoi, " +
            "spct.id AS id_spct, spct.dung_tich, spct.so_luong_ton_kho, " +
            "COALESCE(SUM(CASE WHEN dh.trang_thai = 4 AND " +
            "(:startDate IS NULL OR CONVERT(DATE, dh.ngay_tao) >= :startDate) AND " +
            "(:endDate IS NULL OR CONVERT(DATE, dh.ngay_tao) <= :endDate) " +
            "THEN ctdh.so_luong ELSE 0 END), 0) AS total_quantity_sold, " +
            "CASE " +
            "WHEN spct.so_luong_ton_kho = 0 THEN 'Hết hàng' " +
            "WHEN spct.so_luong_ton_kho BETWEEN 1 AND 10 THEN 'Sắp hết hàng' " +
            "ELSE 'Còn hàng' END AS stock_status, " +
            "COALESCE(SUM(CASE WHEN " +
            "(:startDate IS NULL OR CONVERT(DATE, ctth.ngay_duyet) >= :startDate) AND " +
            "(:endDate IS NULL OR CONVERT(DATE, ctth.ngay_duyet) <= :endDate) " +
            "THEN ctth.so_luong ELSE 0 END), 0) AS so_luot_tra_hang " +
            "FROM san_pham sp " +
            "JOIN spct spct ON sp.id = spct.id_san_pham " +
            "LEFT JOIN thuong_hieu th ON sp.id_thuong_hieu = th.id " +
            "LEFT JOIN nhom_huong nh ON sp.id_nhom_huong = nh.id " +
            "LEFT JOIN danh_muc dm ON sp.id_danh_muc = dm.id " +
            "LEFT JOIN huong_dau hd ON sp.id_huong_dau = hd.id " +
            "LEFT JOIN huong_giua hg ON sp.id_huong_giua = hg.id " +
            "LEFT JOIN huong_cuoi hc ON sp.id_huong_cuoi = hc.id " +
            "LEFT JOIN chi_tiet_don_hang ctdh ON spct.id = ctdh.id_spct " +
            "LEFT JOIN don_hang dh ON ctdh.id_don_hang = dh.id " +
            "LEFT JOIN yeu_cau_tra_hang ctth ON spct.id = ctth.id_spct " +
            "GROUP BY sp.id, sp.ten, sp.mo_ta, th.ten_thuong_hieu, nh.ten_nhom, dm.ten_danh_muc, " +
            "hd.mota, hg.mota, hc.mota, spct.id, spct.dung_tich, spct.so_luong_ton_kho " +
            "ORDER BY total_quantity_sold DESC " +
            "OFFSET :offset ROWS FETCH NEXT :pageSize ROWS ONLY", nativeQuery = true)
    List<Object[]> findBestSellingProductsByDateRange(
            @Param("startDate") String startDate,
            @Param("endDate") String endDate,
            @Param("offset") Long offset,
            @Param("pageSize") Integer pageSize);

    @Query(value = "SELECT COUNT(DISTINCT spct.id) " +
            "FROM san_pham sp " +
            "JOIN spct spct ON sp.id = spct.id_san_pham", nativeQuery = true)
    Long countBestSellingProductsByDateRange(
            @Param("startDate") String startDate,
            @Param("endDate") String endDate);

    @Query(value = "SELECT sp.id AS id_san_pham, sp.ten AS ten_san_pham, sp.mo_ta AS mo_ta_san_pham, " +
            "th.ten_thuong_hieu AS thuong_hieu, nh.ten_nhom AS nhom_huong, dm.ten_danh_muc AS danh_muc, " +
            "hd.mota AS huong_dau, hg.mota AS huong_giua, hc.mota AS huong_cuoi, " +
            "spct.id AS id_spct, spct.dung_tich, spct.so_luong_ton_kho, " +
            "COALESCE(SUM(CASE WHEN dh.trang_thai = 4 AND " +
            "(:year IS NULL OR DATEPART(YEAR, dh.ngay_tao) = :year) AND " +
            "(:week IS NULL OR DATEPART(WEEK, dh.ngay_tao) = :week) " +
            "THEN ctdh.so_luong ELSE 0 END), 0) AS total_quantity_sold, " +
            "CASE " +
            "WHEN spct.so_luong_ton_kho = 0 THEN 'Hết hàng' " +
            "WHEN spct.so_luong_ton_kho BETWEEN 1 AND 10 THEN 'Sắp hết hàng' " +
            "ELSE 'Còn hàng' END AS stock_status, " +
            "COALESCE(SUM(CASE WHEN " +
            "(:year IS NULL OR DATEPART(YEAR, ctth.ngay_duyet) = :year) AND " +
            "(:week IS NULL OR DATEPART(WEEK, ctth.ngay_duyet) = :week) " +
            "THEN ctth.so_luong ELSE 0 END), 0) AS so_luot_tra_hang " +
            "FROM san_pham sp " +
            "JOIN spct spct ON sp.id = spct.id_san_pham " +
            "LEFT JOIN thuong_hieu th ON sp.id_thuong_hieu = th.id " +
            "LEFT JOIN nhom_huong nh ON sp.id_nhom_huong = nh.id " +
            "LEFT JOIN danh_muc dm ON sp.id_danh_muc = dm.id " +
            "LEFT JOIN huong_dau hd ON sp.id_huong_dau = hd.id " +
            "LEFT JOIN huong_giua hg ON sp.id_huong_giua = hg.id " +
            "LEFT JOIN huong_cuoi hc ON sp.id_huong_cuoi = hc.id " +
            "LEFT JOIN chi_tiet_don_hang ctdh ON spct.id = ctdh.id_spct " +
            "LEFT JOIN don_hang dh ON ctdh.id_don_hang = dh.id " +
            "LEFT JOIN yeu_cau_tra_hang ctth ON spct.id = ctth.id_spct " +
            "GROUP BY sp.id, sp.ten, sp.mo_ta, th.ten_thuong_hieu, nh.ten_nhom, dm.ten_danh_muc, " +
            "hd.mota, hg.mota, hc.mota, spct.id, spct.dung_tich, spct.so_luong_ton_kho " +
            "ORDER BY total_quantity_sold DESC " +
            "OFFSET :offset ROWS FETCH NEXT :pageSize ROWS ONLY", nativeQuery = true)
    List<Object[]> findBestSellingProductsByWeek(
            @Param("year") Integer year,
            @Param("week") Integer week,
            @Param("offset") Long offset,
            @Param("pageSize") Integer pageSize);

    @Query(value = "SELECT COUNT(DISTINCT spct.id) " +
            "FROM san_pham sp " +
            "JOIN spct spct ON sp.id = spct.id_san_pham", nativeQuery = true)
    Long countBestSellingProductsByWeek(
            @Param("year") Integer year,
            @Param("week") Integer week);

    @Query(value = "SELECT sp.id AS id_san_pham, sp.ten AS ten_san_pham, sp.mo_ta AS mo_ta_san_pham, " +
            "th.ten_thuong_hieu AS thuong_hieu, nh.ten_nhom AS nhom_huong, dm.ten_danh_muc AS danh_muc, " +
            "hd.mota AS huong_dau, hg.mota AS huong_giua, hc.mota AS huong_cuoi, " +
            "spct.id AS id_spct, spct.dung_tich, spct.so_luong_ton_kho, " +
            "COALESCE(SUM(CASE WHEN dh.trang_thai = 4 AND " +
            "(:year IS NULL OR DATEPART(YEAR, dh.ngay_tao) = :year) AND " +
            "(:month IS NULL OR DATEPART(MONTH, dh.ngay_tao) = :month) " +
            "THEN ctdh.so_luong ELSE 0 END), 0) AS total_quantity_sold, " +
            "CASE " +
            "WHEN spct.so_luong_ton_kho = 0 THEN 'Hết hàng' " +
            "WHEN spct.so_luong_ton_kho BETWEEN 1 AND 10 THEN 'Sắp hết hàng' " +
            "ELSE 'Còn hàng' END AS stock_status, " +
            "COALESCE(SUM(CASE WHEN " +
            "(:year IS NULL OR DATEPART(YEAR, ctth.ngay_duyet) = :year) AND " +
            "(:month IS NULL OR DATEPART(MONTH, ctth.ngay_duyet) = :month) " +
            "THEN ctth.so_luong ELSE 0 END), 0) AS so_luot_tra_hang " +
            "FROM san_pham sp " +
            "JOIN spct spct ON sp.id = spct.id_san_pham " +
            "LEFT JOIN thuong_hieu th ON sp.id_thuong_hieu = th.id " +
            "LEFT JOIN nhom_huong nh ON sp.id_nhom_huong = nh.id " +
            "LEFT JOIN danh_muc dm ON sp.id_danh_muc = dm.id " +
            "LEFT JOIN huong_dau hd ON sp.id_huong_dau = hd.id " +
            "LEFT JOIN huong_giua hg ON sp.id_huong_giua = hg.id " +
            "LEFT JOIN huong_cuoi hc ON sp.id_huong_cuoi = hc.id " +
            "LEFT JOIN chi_tiet_don_hang ctdh ON spct.id = ctdh.id_spct " +
            "LEFT JOIN don_hang dh ON ctdh.id_don_hang = dh.id " +
            "LEFT JOIN yeu_cau_tra_hang ctth ON spct.id = ctth.id_spct " +
            "GROUP BY sp.id, sp.ten, sp.mo_ta, th.ten_thuong_hieu, nh.ten_nhom, dm.ten_danh_muc, " +
            "hd.mota, hg.mota, hc.mota, spct.id, spct.dung_tich, spct.so_luong_ton_kho " +
            "ORDER BY total_quantity_sold DESC " +
            "OFFSET :offset ROWS FETCH NEXT :pageSize ROWS ONLY", nativeQuery = true)
    List<Object[]> findBestSellingProductsByMonth(
            @Param("year") Integer year,
            @Param("month") Integer month,
            @Param("offset") Long offset,
            @Param("pageSize") Integer pageSize);

    @Query(value = "SELECT COUNT(DISTINCT spct.id) " +
            "FROM san_pham sp " +
            "JOIN spct spct ON sp.id = spct.id_san_pham", nativeQuery = true)
    Long countBestSellingProductsByMonth(
            @Param("year") Integer year,
            @Param("month") Integer month);

    @Query(value = "SELECT sp.id AS id_san_pham, sp.ten AS ten_san_pham, sp.mo_ta AS mo_ta_san_pham, " +
            "th.ten_thuong_hieu AS thuong_hieu, nh.ten_nhom AS nhom_huong, dm.ten_danh_muc AS danh_muc, " +
            "hd.mota AS huong_dau, hg.mota AS huong_giua, hc.mota AS huong_cuoi, " +
            "spct.id AS id_spct, spct.dung_tich, spct.so_luong_ton_kho, " +
            "COALESCE(SUM(CASE WHEN dh.trang_thai = 4 AND " +
            "(:year IS NULL OR DATEPART(YEAR, dh.ngay_tao) = :year) " +
            "THEN ctdh.so_luong ELSE 0 END), 0) AS total_quantity_sold, " +
            "CASE " +
            "WHEN spct.so_luong_ton_kho = 0 THEN 'Hết hàng' " +
            "WHEN spct.so_luong_ton_kho BETWEEN 1 AND 10 THEN 'Sắp hết hàng' " +
            "ELSE 'Còn hàng' END AS stock_status, " +
            "COALESCE(SUM(CASE WHEN " +
            "(:year IS NULL OR DATEPART(YEAR, ctth.ngay_duyet) = :year) " +
            "THEN ctth.so_luong ELSE 0 END), 0) AS so_luot_tra_hang " +
            "FROM san_pham sp " +
            "JOIN spct spct ON sp.id = spct.id_san_pham " +
            "LEFT JOIN thuong_hieu th ON sp.id_thuong_hieu = th.id " +
            "LEFT JOIN nhom_huong nh ON sp.id_nhom_huong = nh.id " +
            "LEFT JOIN danh_muc dm ON sp.id_danh_muc = dm.id " +
            "LEFT JOIN huong_dau hd ON sp.id_huong_dau = hd.id " +
            "LEFT JOIN huong_giua hg ON sp.id_huong_giua = hg.id " +
            "LEFT JOIN huong_cuoi hc ON sp.id_huong_cuoi = hc.id " +
            "LEFT JOIN chi_tiet_don_hang ctdh ON spct.id = ctdh.id_spct " +
            "LEFT JOIN don_hang dh ON ctdh.id_don_hang = dh.id " +
            "LEFT JOIN yeu_cau_tra_hang ctth ON spct.id = ctth.id_spct " +
            "GROUP BY sp.id, sp.ten, sp.mo_ta, th.ten_thuong_hieu, nh.ten_nhom, dm.ten_danh_muc, " +
            "hd.mota, hg.mota, hc.mota, spct.id, spct.dung_tich, spct.so_luong_ton_kho " +
            "ORDER BY total_quantity_sold DESC " +
            "OFFSET :offset ROWS FETCH NEXT :pageSize ROWS ONLY", nativeQuery = true)
    List<Object[]> findBestSellingProductsByYear(
            @Param("year") Integer year,
            @Param("offset") Long offset,
            @Param("pageSize") Integer pageSize);

    @Query(value = "SELECT COUNT(DISTINCT spct.id) " +
            "FROM san_pham sp " +
            "JOIN spct spct ON sp.id = spct.id_san_pham", nativeQuery = true)
    Long countBestSellingProductsByYear(@Param("year") Integer year);

    @Query("SELECT new com.example.scent.dto.BestSellingSanPhamInfoDTO(" +
            "sp.idSanPham, sp.tenSanPham, MIN(spct.donGia), " +
            "(SELECT ha.link FROM HinhAnh ha WHERE ha.sanPham.idSanPham = sp.idSanPham ORDER BY ha.id LIMIT 1), " +
            "th.tenThuongHieu, dm.tenDanhMuc, " +
            "hd.moTaHuongDau, hg.moTaHuongGiua, hc.moTaHuongCuoi, " +
            "nh.id, nh.tenNhomHuong, th.quocGia, sp.trangThai, " +
            "(SELECT SUM(spct2.soLuongTonKho) FROM Spct spct2 WHERE spct2.sanPham.idSanPham = sp.idSanPham), " +
            "sp.createDate, SUM(ctdh.soLuong)) " +
            "FROM ChiTietDonHang ctdh " +
            "JOIN ctdh.spct spct " +
            "JOIN spct.sanPham sp " +
            "JOIN sp.thuongHieu th " +
            "JOIN sp.danhMuc dm " +
            "LEFT JOIN sp.huongDau hd " +
            "LEFT JOIN sp.huongGiua hg " +
            "LEFT JOIN sp.huongCuoi hc " +
            "LEFT JOIN sp.nhomHuong nh " +
            "JOIN ctdh.donHang dh " +
            "WHERE dh.trangThai = 4 " +
            "GROUP BY sp.idSanPham, sp.tenSanPham, th.tenThuongHieu, dm.tenDanhMuc, " +
            "hd.moTaHuongDau, hg.moTaHuongGiua, hc.moTaHuongCuoi, nh.id, nh.tenNhomHuong, th.quocGia, sp.trangThai, sp.createDate " +
            "ORDER BY SUM(ctdh.soLuong) DESC")
    List<BestSellingSanPhamInfoDTO> findTopSellingProducts();
}