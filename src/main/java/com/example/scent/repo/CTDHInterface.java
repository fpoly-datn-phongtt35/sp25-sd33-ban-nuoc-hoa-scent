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

    @Query(value = "WITH ProductStats AS ( " +
            "SELECT sp.id AS id_san_pham, sp.ten AS ten_san_pham, " +
            "th.ten_thuong_hieu AS thuong_hieu, nh.ten_nhom AS nhom_huong, dm.ten_danh_muc AS danh_muc, " +
            "spct.id AS id_spct, spct.dung_tich, spct.so_luong_ton_kho, " +
            "COALESCE(SUM(CASE WHEN dh.trang_thai = 4 AND " +
            "(:startDate IS NOT NULL OR :endDate IS NOT NULL) AND " +
            "(CONVERT(DATE, dh.ngay_tao) >= :startDate OR :startDate IS NULL) AND " +
            "(CONVERT(DATE, dh.ngay_tao) <= :endDate OR :endDate IS NULL) " +
            "THEN ctdh.so_luong ELSE 0 END), 0) AS total_quantity_sold, " +
            "CASE " +
            "WHEN spct.so_luong_ton_kho = 0 THEN 'Hết hàng' " +
            "WHEN spct.so_luong_ton_kho BETWEEN 1 AND 5 THEN 'Sắp hết hàng' " +
            "ELSE 'Còn hàng' END AS stock_status, " +
            "COALESCE(SUM(CASE WHEN ctth.trangThai = 3 AND " +
            "(:startDate IS NOT NULL OR :endDate IS NOT NULL) AND " +
            "(CONVERT(DATE, ctth.ngay_duyet) >= :startDate OR :startDate IS NULL) AND " +
            "(CONVERT(DATE, ctth.ngay_duyet) <= :endDate OR :endDate IS NULL) " +
            "THEN ctth.so_luong ELSE 0 END), 0) AS so_luot_tra_hang " +
            "FROM san_pham sp " +
            "JOIN spct spct ON sp.id = spct.id_san_pham " +
            "LEFT JOIN thuong_hieu th ON sp.id_thuong_hieu = th.id " +
            "LEFT JOIN nhom_huong nh ON sp.id_nhom_huong = nh.id " +
            "LEFT JOIN danh_muc dm ON sp.id_danh_muc = dm.id " +
            "LEFT JOIN chi_tiet_don_hang ctdh ON spct.id = ctdh.id_spct " +
            "LEFT JOIN don_hang dh ON ctdh.id_don_hang = dh.id " +
            "LEFT JOIN yeu_cau_tra_hang ctth ON spct.id = ctth.id_spct " +
            "WHERE (:searchQuery IS NULL OR " +
            "sp.ten LIKE CONCAT('%', :searchQuery, '%') OR " +
            "CAST(sp.id AS CHAR) LIKE CONCAT('%', :searchQuery, '%') OR " +
            "CAST(spct.id AS CHAR) LIKE CONCAT('%', :searchQuery, '%') OR " +
            "nh.ten_nhom LIKE CONCAT('%', :searchQuery, '%') OR " +
            "dm.ten_danh_muc LIKE CONCAT('%', :searchQuery, '%')) " +
            "GROUP BY sp.id, sp.ten, th.ten_thuong_hieu, nh.ten_nhom, dm.ten_danh_muc, " +
            "spct.id, spct.dung_tich, spct.so_luong_ton_kho " +
            ") " +
            "SELECT id_san_pham, ten_san_pham, thuong_hieu, nhom_huong, danh_muc, " +
            "id_spct, dung_tich, so_luong_ton_kho, total_quantity_sold, stock_status, so_luot_tra_hang " +
            "FROM ProductStats " +
            "ORDER BY " +
            "CASE WHEN :sortField = 'totalQuantitySold' AND :sortDirection = 'asc' THEN total_quantity_sold END ASC, " +
            "CASE WHEN :sortField = 'totalQuantitySold' AND :sortDirection = 'desc' THEN total_quantity_sold END DESC, " +
            "CASE WHEN :sortField = 'soLuongTonKho' AND :sortDirection = 'asc' THEN so_luong_ton_kho END ASC, " +
            "CASE WHEN :sortField = 'soLuongTonKho' AND :sortDirection = 'desc' THEN so_luong_ton_kho END DESC, " +
            "CASE WHEN :sortField = 'soLuotTraHang' AND :sortDirection = 'asc' THEN so_luot_tra_hang END ASC, " +
            "CASE WHEN :sortField = 'soLuotTraHang' AND :sortDirection = 'desc' THEN so_luot_tra_hang END DESC " +
            "OFFSET :offset ROWS FETCH NEXT :pageSize ROWS ONLY", nativeQuery = true)
    List<Object[]> findBestSellingProductsByDateRangeWithSearch(
            @Param("startDate") String startDate,
            @Param("endDate") String endDate,
            @Param("searchQuery") String searchQuery,
            @Param("sortField") String sortField,
            @Param("sortDirection") String sortDirection,
            @Param("offset") Long offset,
            @Param("pageSize") Integer pageSize);

    @Query(value = "SELECT COUNT(DISTINCT spct.id) " +
            "FROM san_pham sp " +
            "JOIN spct spct ON sp.id = spct.id_san_pham " +
            "LEFT JOIN thuong_hieu th ON sp.id_thuong_hieu = th.id " +
            "LEFT JOIN nhom_huong nh ON sp.id_nhom_huong = nh.id " +
            "LEFT JOIN danh_muc dm ON sp.id_danh_muc = dm.id " +
            "WHERE (:searchQuery IS NULL OR " +
            "sp.ten LIKE CONCAT('%', :searchQuery, '%') OR " +
            "CAST(sp.id AS CHAR) LIKE CONCAT('%', :searchQuery, '%') OR " +
            "CAST(spct.id AS CHAR) LIKE CONCAT('%', :searchQuery, '%') OR " +
            "nh.ten_nhom LIKE CONCAT('%', :searchQuery, '%') OR " +
            "dm.ten_danh_muc LIKE CONCAT('%', :searchQuery, '%'))", nativeQuery = true)
    Long countBestSellingProductsByDateRangeWithSearch(
            @Param("startDate") String startDate,
            @Param("endDate") String endDate,
            @Param("searchQuery") String searchQuery);

    @Query(value = "WITH ProductStats AS ( " +
            "SELECT sp.id AS id_san_pham, sp.ten AS ten_san_pham, " +
            "th.ten_thuong_hieu AS thuong_hieu, nh.ten_nhom AS nhom_huong, dm.ten_danh_muc AS danh_muc, " +
            "spct.id AS id_spct, spct.dung_tich, spct.so_luong_ton_kho, " +
            "COALESCE(SUM(CASE WHEN dh.trang_thai = 4 AND " +
            "(:year IS NOT NULL OR :week IS NOT NULL) AND " +
            "(DATEPART(YEAR, dh.ngay_tao) = :year OR :year IS NULL) AND " +
            "(DATEPART(WEEK, dh.ngay_tao) = :week OR :week IS NULL) " +
            "THEN ctdh.so_luong ELSE 0 END), 0) AS total_quantity_sold, " +
            "CASE " +
            "WHEN spct.so_luong_ton_kho = 0 THEN 'Hết hàng' " +
            "WHEN spct.so_luong_ton_kho BETWEEN 1 AND 5 THEN 'Sắp hết hàng' " +
            "ELSE 'Còn hàng' END AS stock_status, " +
            "COALESCE(SUM(CASE WHEN ctth.trangThai = 3 AND " +
            "(:year IS NOT NULL OR :week IS NOT NULL) AND " +
            "(DATEPART(YEAR, ctth.ngay_duyet) = :year OR :year IS NULL) AND " +
            "(DATEPART(WEEK, ctth.ngay_duyet) = :week OR :week IS NULL) " +
            "THEN ctth.so_luong ELSE 0 END), 0) AS so_luot_tra_hang " +
            "FROM san_pham sp " +
            "JOIN spct spct ON sp.id = spct.id_san_pham " +
            "LEFT JOIN thuong_hieu th ON sp.id_thuong_hieu = th.id " +
            "LEFT JOIN nhom_huong nh ON sp.id_nhom_huong = nh.id " +
            "LEFT JOIN danh_muc dm ON sp.id_danh_muc = dm.id " +
            "LEFT JOIN chi_tiet_don_hang ctdh ON spct.id = ctdh.id_spct " +
            "LEFT JOIN don_hang dh ON ctdh.id_don_hang = dh.id " +
            "LEFT JOIN yeu_cau_tra_hang ctth ON spct.id = ctth.id_spct " +
            "WHERE (:searchQuery IS NULL OR " +
            "sp.ten LIKE CONCAT('%', :searchQuery, '%') OR " +
            "CAST(sp.id AS CHAR) LIKE CONCAT('%', :searchQuery, '%') OR " +
            "CAST(spct.id AS CHAR) LIKE CONCAT('%', :searchQuery, '%') OR " +
            "nh.ten_nhom LIKE CONCAT('%', :searchQuery, '%') OR " +
            "dm.ten_danh_muc LIKE CONCAT('%', :searchQuery, '%')) " +
            "GROUP BY sp.id, sp.ten, th.ten_thuong_hieu, nh.ten_nhom, dm.ten_danh_muc, " +
            "spct.id, spct.dung_tich, spct.so_luong_ton_kho " +
            ") " +
            "SELECT id_san_pham, ten_san_pham, thuong_hieu, nhom_huong, danh_muc, " +
            "id_spct, dung_tich, so_luong_ton_kho, total_quantity_sold, stock_status, so_luot_tra_hang " +
            "FROM ProductStats " +
            "ORDER BY " +
            "CASE WHEN :sortField = 'totalQuantitySold' AND :sortDirection = 'asc' THEN total_quantity_sold END ASC, " +
            "CASE WHEN :sortField = 'totalQuantitySold' AND :sortDirection = 'desc' THEN total_quantity_sold END DESC, " +
            "CASE WHEN :sortField = 'soLuongTonKho' AND :sortDirection = 'asc' THEN so_luong_ton_kho END ASC, " +
            "CASE WHEN :sortField = 'soLuongTonKho' AND :sortDirection = 'desc' THEN so_luong_ton_kho END DESC, " +
            "CASE WHEN :sortField = 'soLuotTraHang' AND :sortDirection = 'asc' THEN so_luot_tra_hang END ASC, " +
            "CASE WHEN :sortField = 'soLuotTraHang' AND :sortDirection = 'desc' THEN so_luot_tra_hang END DESC " +
            "OFFSET :offset ROWS FETCH NEXT :pageSize ROWS ONLY", nativeQuery = true)
    List<Object[]> findBestSellingProductsByWeekWithSearch(
            @Param("year") Integer year,
            @Param("week") Integer week,
            @Param("searchQuery") String searchQuery,
            @Param("sortField") String sortField,
            @Param("sortDirection") String sortDirection,
            @Param("offset") Long offset,
            @Param("pageSize") Integer pageSize);

    @Query(value = "SELECT COUNT(DISTINCT spct.id) " +
            "FROM san_pham sp " +
            "JOIN spct spct ON sp.id = spct.id_san_pham " +
            "LEFT JOIN thuong_hieu th ON sp.id_thuong_hieu = th.id " +
            "LEFT JOIN nhom_huong nh ON sp.id_nhom_huong = nh.id " +
            "LEFT JOIN danh_muc dm ON sp.id_danh_muc = dm.id " +
            "WHERE (:searchQuery IS NULL OR " +
            "sp.ten LIKE CONCAT('%', :searchQuery, '%') OR " +
            "CAST(sp.id AS CHAR) LIKE CONCAT('%', :searchQuery, '%') OR " +
            "CAST(spct.id AS CHAR) LIKE CONCAT('%', :searchQuery, '%') OR " +
            "nh.ten_nhom LIKE CONCAT('%', :searchQuery, '%') OR " +
            "dm.ten_danh_muc LIKE CONCAT('%', :searchQuery, '%'))", nativeQuery = true)
    Long countBestSellingProductsByWeekWithSearch(
            @Param("year") Integer year,
            @Param("week") Integer week,
            @Param("searchQuery") String searchQuery);

    @Query(value = "WITH ProductStats AS ( " +
            "SELECT sp.id AS id_san_pham, sp.ten AS ten_san_pham, " +
            "th.ten_thuong_hieu AS thuong_hieu, nh.ten_nhom AS nhom_huong, dm.ten_danh_muc AS danh_muc, " +
            "spct.id AS id_spct, spct.dung_tich, spct.so_luong_ton_kho, " +
            "COALESCE(SUM(CASE WHEN dh.trang_thai = 4 AND " +
            "(:year IS NOT NULL OR :month IS NOT NULL) AND " +
            "(DATEPART(YEAR, dh.ngay_tao) = :year OR :year IS NULL) AND " +
            "(DATEPART(MONTH, dh.ngay_tao) = :month OR :month IS NULL) " +
            "THEN ctdh.so_luong ELSE 0 END), 0) AS total_quantity_sold, " +
            "CASE " +
            "WHEN spct.so_luong_ton_kho = 0 THEN 'Hết hàng' " +
            "WHEN spct.so_luong_ton_kho BETWEEN 1 AND 5 THEN 'Sắp hết hàng' " +
            "ELSE 'Còn hàng' END AS stock_status, " +
            "COALESCE(SUM(CASE WHEN ctth.trangThai = 3 AND " +
            "(:year IS NOT NULL OR :month IS NOT NULL) AND " +
            "(DATEPART(YEAR, ctth.ngay_duyet) = :year OR :year IS NULL) AND " +
            "(DATEPART(MONTH, ctth.ngay_duyet) = :month OR :month IS NULL) " +
            "THEN ctth.so_luong ELSE 0 END), 0) AS so_luot_tra_hang " +
            "FROM san_pham sp " +
            "JOIN spct spct ON sp.id = spct.id_san_pham " +
            "LEFT JOIN thuong_hieu th ON sp.id_thuong_hieu = th.id " +
            "LEFT JOIN nhom_huong nh ON sp.id_nhom_huong = nh.id " +
            "LEFT JOIN danh_muc dm ON sp.id_danh_muc = dm.id " +
            "LEFT JOIN chi_tiet_don_hang ctdh ON spct.id = ctdh.id_spct " +
            "LEFT JOIN don_hang dh ON ctdh.id_don_hang = dh.id " +
            "LEFT JOIN yeu_cau_tra_hang ctth ON spct.id = ctth.id_spct " +
            "WHERE (:searchQuery IS NULL OR " +
            "sp.ten LIKE CONCAT('%', :searchQuery, '%') OR " +
            "CAST(sp.id AS CHAR) LIKE CONCAT('%', :searchQuery, '%') OR " +
            "CAST(spct.id AS CHAR) LIKE CONCAT('%', :searchQuery, '%') OR " +
            "nh.ten_nhom LIKE CONCAT('%', :searchQuery, '%') OR " +
            "dm.ten_danh_muc LIKE CONCAT('%', :searchQuery, '%')) " +
            "GROUP BY sp.id, sp.ten, th.ten_thuong_hieu, nh.ten_nhom, dm.ten_danh_muc, " +
            "spct.id, spct.dung_tich, spct.so_luong_ton_kho " +
            ") " +
            "SELECT id_san_pham, ten_san_pham, thuong_hieu, nhom_huong, danh_muc, " +
            "id_spct, dung_tich, so_luong_ton_kho, total_quantity_sold, stock_status, so_luot_tra_hang " +
            "FROM ProductStats " +
            "ORDER BY " +
            "CASE WHEN :sortField = 'totalQuantitySold' AND :sortDirection = 'asc' THEN total_quantity_sold END ASC, " +
            "CASE WHEN :sortField = 'totalQuantitySold' AND :sortDirection = 'desc' THEN total_quantity_sold END DESC, " +
            "CASE WHEN :sortField = 'soLuongTonKho' AND :sortDirection = 'asc' THEN so_luong_ton_kho END ASC, " +
            "CASE WHEN :sortField = 'soLuongTonKho' AND :sortDirection = 'desc' THEN so_luong_ton_kho END DESC, " +
            "CASE WHEN :sortField = 'soLuotTraHang' AND :sortDirection = 'asc' THEN so_luot_tra_hang END ASC, " +
            "CASE WHEN :sortField = 'soLuotTraHang' AND :sortDirection = 'desc' THEN so_luot_tra_hang END DESC " +
            "OFFSET :offset ROWS FETCH NEXT :pageSize ROWS ONLY", nativeQuery = true)
    List<Object[]> findBestSellingProductsByMonthWithSearch(
            @Param("year") Integer year,
            @Param("month") Integer month,
            @Param("searchQuery") String searchQuery,
            @Param("sortField") String sortField,
            @Param("sortDirection") String sortDirection,
            @Param("offset") Long offset,
            @Param("pageSize") Integer pageSize);

    @Query(value = "SELECT COUNT(DISTINCT spct.id) " +
            "FROM san_pham sp " +
            "JOIN spct spct ON sp.id = spct.id_san_pham " +
            "LEFT JOIN thuong_hieu th ON sp.id_thuong_hieu = th.id " +
            "LEFT JOIN nhom_huong nh ON sp.id_nhom_huong = nh.id " +
            "LEFT JOIN danh_muc dm ON sp.id_danh_muc = dm.id " +
            "WHERE (:searchQuery IS NULL OR " +
            "sp.ten LIKE CONCAT('%', :searchQuery, '%') OR " +
            "CAST(sp.id AS CHAR) LIKE CONCAT('%', :searchQuery, '%') OR " +
            "CAST(spct.id AS CHAR) LIKE CONCAT('%', :searchQuery, '%') OR " +
            "nh.ten_nhom LIKE CONCAT('%', :searchQuery, '%') OR " +
            "dm.ten_danh_muc LIKE CONCAT('%', :searchQuery, '%'))", nativeQuery = true)
    Long countBestSellingProductsByMonthWithSearch(
            @Param("year") Integer year,
            @Param("month") Integer month,
            @Param("searchQuery") String searchQuery);

    @Query(value = "WITH ProductStats AS ( " +
            "SELECT sp.id AS id_san_pham, sp.ten AS ten_san_pham, " +
            "th.ten_thuong_hieu AS thuong_hieu, nh.ten_nhom AS nhom_huong, dm.ten_danh_muc AS danh_muc, " +
            "spct.id AS id_spct, spct.dung_tich, spct.so_luong_ton_kho, " +
            "COALESCE(SUM(CASE WHEN dh.trang_thai = 4 AND " +
            "(:year IS NOT NULL) AND " +
            "(DATEPART(YEAR, dh.ngay_tao) = :year) " +
            "THEN ctdh.so_luong ELSE 0 END), 0) AS total_quantity_sold, " +
            "CASE " +
            "WHEN spct.so_luong_ton_kho = 0 THEN 'Hết hàng' " +
            "WHEN spct.so_luong_ton_kho BETWEEN 1 AND 5 THEN 'Sắp hết hàng' " +
            "ELSE 'Còn hàng' END AS stock_status, " +
            "COALESCE(SUM(CASE WHEN ctth.trangThai = 3 AND " +
            "(:year IS NOT NULL) AND " +
            "(DATEPART(YEAR, ctth.ngay_duyet) = :year) " +
            "THEN ctth.so_luong ELSE 0 END), 0) AS so_luot_tra_hang " +
            "FROM san_pham sp " +
            "JOIN spct spct ON sp.id = spct.id_san_pham " +
            "LEFT JOIN thuong_hieu th ON sp.id_thuong_hieu = th.id " +
            "LEFT JOIN nhom_huong nh ON sp.id_nhom_huong = nh.id " +
            "LEFT JOIN danh_muc dm ON sp.id_danh_muc = dm.id " +
            "LEFT JOIN chi_tiet_don_hang ctdh ON spct.id = ctdh.id_spct " +
            "LEFT JOIN don_hang dh ON ctdh.id_don_hang = dh.id " +
            "LEFT JOIN yeu_cau_tra_hang ctth ON spct.id = ctth.id_spct " +
            "WHERE (:searchQuery IS NULL OR " +
            "sp.ten LIKE CONCAT('%', :searchQuery, '%') OR " +
            "CAST(sp.id AS CHAR) LIKE CONCAT('%', :searchQuery, '%') OR " +
            "CAST(spct.id AS CHAR) LIKE CONCAT('%', :searchQuery, '%') OR " +
            "nh.ten_nhom LIKE CONCAT('%', :searchQuery, '%') OR " +
            "dm.ten_danh_muc LIKE CONCAT('%', :searchQuery, '%')) " +
            "GROUP BY sp.id, sp.ten, th.ten_thuong_hieu, nh.ten_nhom, dm.ten_danh_muc, " +
            "spct.id, spct.dung_tich, spct.so_luong_ton_kho " +
            ") " +
            "SELECT id_san_pham, ten_san_pham, thuong_hieu, nhom_huong, danh_muc, " +
            "id_spct, dung_tich, so_luong_ton_kho, total_quantity_sold, stock_status, so_luot_tra_hang " +
            "FROM ProductStats " +
            "ORDER BY " +
            "CASE WHEN :sortField = 'totalQuantitySold' AND :sortDirection = 'asc' THEN total_quantity_sold END ASC, " +
            "CASE WHEN :sortField = 'totalQuantitySold' AND :sortDirection = 'desc' THEN total_quantity_sold END DESC, " +
            "CASE WHEN :sortField = 'soLuongTonKho' AND :sortDirection = 'asc' THEN so_luong_ton_kho END ASC, " +
            "CASE WHEN :sortField = 'soLuongTonKho' AND :sortDirection = 'desc' THEN so_luong_ton_kho END DESC, " +
            "CASE WHEN :sortField = 'soLuotTraHang' AND :sortDirection = 'asc' THEN so_luot_tra_hang END ASC, " +
            "CASE WHEN :sortField = 'soLuotTraHang' AND :sortDirection = 'desc' THEN so_luot_tra_hang END DESC " +
            "OFFSET :offset ROWS FETCH NEXT :pageSize ROWS ONLY", nativeQuery = true)
    List<Object[]> findBestSellingProductsByYearWithSearch(
            @Param("year") Integer year,
            @Param("searchQuery") String searchQuery,
            @Param("sortField") String sortField,
            @Param("sortDirection") String sortDirection,
            @Param("offset") Long offset,
            @Param("pageSize") Integer pageSize);

    @Query(value = "SELECT COUNT(DISTINCT spct.id) " +
            "FROM san_pham sp " +
            "JOIN spct spct ON sp.id = spct.id_san_pham " +
            "LEFT JOIN thuong_hieu th ON sp.id_thuong_hieu = th.id " +
            "LEFT JOIN nhom_huong nh ON sp.id_nhom_huong = nh.id " +
            "LEFT JOIN danh_muc dm ON sp.id_danh_muc = dm.id " +
            "WHERE (:searchQuery IS NULL OR " +
            "sp.ten LIKE CONCAT('%', :searchQuery, '%') OR " +
            "CAST(sp.id AS CHAR) LIKE CONCAT('%', :searchQuery, '%') OR " +
            "CAST(spct.id AS CHAR) LIKE CONCAT('%', :searchQuery, '%') OR " +
            "nh.ten_nhom LIKE CONCAT('%', :searchQuery, '%') OR " +
            "dm.ten_danh_muc LIKE CONCAT('%', :searchQuery, '%'))", nativeQuery = true)
    Long countBestSellingProductsByYearWithSearch(
            @Param("year") Integer year,
            @Param("searchQuery") String searchQuery);
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