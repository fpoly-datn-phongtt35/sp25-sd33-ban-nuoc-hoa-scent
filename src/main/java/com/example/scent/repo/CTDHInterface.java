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

    @Query(value = "WITH ReturnStats AS ( " +
            "SELECT ctth.id_don_hang, ctth.id_spct, " +
            "SUM(ctth.so_luong) AS returned_quantity " +
            "FROM yeu_cau_tra_hang ctth " +
            "WHERE ctth.trangThai = 3 " +
            "AND ctth.ngay_duyet IS NOT NULL " +
            "AND (:startDate IS NULL OR CONVERT(DATE, ctth.ngay_duyet) >= :startDate) " +
            "AND (:endDate IS NULL OR CONVERT(DATE, ctth.ngay_duyet) <= :endDate) " +
            "GROUP BY ctth.id_don_hang, ctth.id_spct " +
            "), " +
            "ProductStats AS ( " +
            "SELECT sp.id AS id_san_pham, sp.ten AS ten_san_pham, " +
            "th.ten_thuong_hieu AS thuong_hieu, nh.ten_nhom AS nhom_huong, dm.ten_danh_muc AS danh_muc, " +
            "spct.id AS id_spct, spct.dung_tich, spct.so_luong_ton_kho, " +
            "COALESCE(SUM(CASE WHEN dh.trang_thai = 4 AND dh.id IS NOT NULL " +
            "AND (:startDate IS NULL OR CONVERT(DATE, dh.ngay_tao) >= :startDate) " +
            "AND (:endDate IS NULL OR CONVERT(DATE, dh.ngay_tao) <= :endDate) " +
            "THEN ctdh.so_luong ELSE 0 END), 0) AS total_ordered, " +
            "COALESCE(SUM(COALESCE(rs.returned_quantity, 0)), 0) AS total_returned, " +
            "CASE WHEN spct.so_luong_ton_kho = 0 THEN N'Hết hàng' " +
            "WHEN spct.so_luong_ton_kho BETWEEN 1 AND 5 THEN N'Sắp hết hàng' " +
            "ELSE 'Còn hàng' END AS stock_status " +
            "FROM san_pham sp " +
            "JOIN spct spct ON sp.id = spct.id_san_pham " +
            "LEFT JOIN thuong_hieu th ON sp.id_thuong_hieu = th.id " +
            "LEFT JOIN nhom_huong nh ON sp.id_nhom_huong = nh.id " +
            "LEFT JOIN danh_muc dm ON sp.id_danh_muc = dm.id " +
            "LEFT JOIN chi_tiet_don_hang ctdh ON spct.id = ctdh.id_spct " +
            "LEFT JOIN don_hang dh ON ctdh.id_don_hang = dh.id " +
            "LEFT JOIN ReturnStats rs ON ctdh.id_don_hang = rs.id_don_hang AND ctdh.id_spct = rs.id_spct " +
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
            "id_spct, dung_tich, so_luong_ton_kho, " +
            "(total_ordered - total_returned) AS total_quantity_sold, " +
            "stock_status, total_returned AS so_luot_tra_hang " +
            "FROM ProductStats " +
            "ORDER BY " +
            "CASE WHEN :sortField = 'totalQuantitySold' AND :sortDirection = 'asc' THEN (total_ordered - total_returned) END ASC, " +
            "CASE WHEN :sortField = 'totalQuantitySold' AND :sortDirection = 'desc' THEN (total_ordered - total_returned) END DESC, " +
            "CASE WHEN :sortField = 'soLuongTonKho' AND :sortDirection = 'asc' THEN so_luong_ton_kho END ASC, " +
            "CASE WHEN :sortField = 'soLuongTonKho' AND :sortDirection = 'desc' THEN so_luong_ton_kho END DESC, " +
            "CASE WHEN :sortField = 'soLuotTraHang' AND :sortDirection = 'asc' THEN total_returned END ASC, " +
            "CASE WHEN :sortField = 'soLuotTraHang' AND :sortDirection = 'desc' THEN total_returned END DESC " +
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
            "LEFT JOIN chi_tiet_don_hang ctdh ON spct.id = ctdh.id_spct " +
            "LEFT JOIN don_hang dh ON ctdh.id_don_hang = dh.id " +
            "WHERE (:searchQuery IS NULL OR " +
            "sp.ten LIKE CONCAT('%', :searchQuery, '%') OR " +
            "CAST(sp.id AS CHAR) LIKE CONCAT('%', :searchQuery, '%') OR " +
            "CAST(spct.id AS CHAR) LIKE CONCAT('%', :searchQuery, '%') OR " +
            "nh.ten_nhom LIKE CONCAT('%', :searchQuery, '%') OR " +
            "dm.ten_danh_muc LIKE CONCAT('%', :searchQuery, '%')) " +
            "AND dh.trang_thai = 4 " +
            "AND (:startDate IS NULL OR CONVERT(DATE, dh.ngay_tao) >= :startDate) " +
            "AND (:endDate IS NULL OR CONVERT(DATE, dh.ngay_tao) <= :endDate)", nativeQuery = true)
    Long countBestSellingProductsByDateRangeWithSearch(
            @Param("startDate") String startDate,
            @Param("endDate") String endDate,
            @Param("searchQuery") String searchQuery);

    @Query(value = "WITH ReturnStats AS ( " +
            "SELECT ctth.id_don_hang, ctth.id_spct, " +
            "SUM(ctth.so_luong) AS returned_quantity " +
            "FROM yeu_cau_tra_hang ctth " +
            "WHERE ctth.trangThai = 3 " +
            "AND ctth.ngay_duyet IS NOT NULL " +
            "AND (:year IS NULL OR DATEPART(YEAR, ctth.ngay_duyet) = :year) " +
            "AND (:week IS NULL OR DATEPART(WEEK, ctth.ngay_duyet) = :week) " +
            "GROUP BY ctth.id_don_hang, ctth.id_spct " +
            "), " +
            "ProductStats AS ( " +
            "SELECT sp.id AS id_san_pham, sp.ten AS ten_san_pham, " +
            "th.ten_thuong_hieu AS thuong_hieu, nh.ten_nhom AS nhom_huong, dm.ten_danh_muc AS danh_muc, " +
            "spct.id AS id_spct, spct.dung_tich, spct.so_luong_ton_kho, " +
            "COALESCE(SUM(CASE WHEN dh.trang_thai = 4 AND dh.id IS NOT NULL " +
            "AND (:year IS NULL OR DATEPART(YEAR, dh.ngay_tao) = :year) " +
            "AND (:week IS NULL OR DATEPART(WEEK, dh.ngay_tao) = :week) " +
            "THEN ctdh.so_luong ELSE 0 END), 0) AS total_ordered, " +
            "COALESCE(SUM(COALESCE(rs.returned_quantity, 0)), 0) AS total_returned, " +
            "CASE WHEN spct.so_luong_ton_kho = 0 THEN N'Hết hàng' " +
            "WHEN spct.so_luong_ton_kho BETWEEN 1 AND 5 THEN N'Sắp hết hàng' " +
            "ELSE 'Còn hàng' END AS stock_status " +
            "FROM san_pham sp " +
            "JOIN spct spct ON sp.id = spct.id_san_pham " +
            "LEFT JOIN thuong_hieu th ON sp.id_thuong_hieu = th.id " +
            "LEFT JOIN nhom_huong nh ON sp.id_nhom_huong = nh.id " +
            "LEFT JOIN danh_muc dm ON sp.id_danh_muc = dm.id " +
            "LEFT JOIN chi_tiet_don_hang ctdh ON spct.id = ctdh.id_spct " +
            "LEFT JOIN don_hang dh ON ctdh.id_don_hang = dh.id " +
            "LEFT JOIN ReturnStats rs ON ctdh.id_don_hang = rs.id_don_hang AND ctdh.id_spct = rs.id_spct " +
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
            "id_spct, dung_tich, so_luong_ton_kho, " +
            "(total_ordered - total_returned) AS total_quantity_sold, " +
            "stock_status, total_returned AS so_luot_tra_hang " +
            "FROM ProductStats " +
            "ORDER BY " +
            "CASE WHEN :sortField = 'totalQuantitySold' AND :sortDirection = 'asc' THEN (total_ordered - total_returned) END ASC, " +
            "CASE WHEN :sortField = 'totalQuantitySold' AND :sortDirection = 'desc' THEN (total_ordered - total_returned) END DESC, " +
            "CASE WHEN :sortField = 'soLuongTonKho' AND :sortDirection = 'asc' THEN so_luong_ton_kho END ASC, " +
            "CASE WHEN :sortField = 'soLuongTonKho' AND :sortDirection = 'desc' THEN so_luong_ton_kho END DESC, " +
            "CASE WHEN :sortField = 'soLuotTraHang' AND :sortDirection = 'asc' THEN total_returned END ASC, " +
            "CASE WHEN :sortField = 'soLuotTraHang' AND :sortDirection = 'desc' THEN total_returned END DESC " +
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
            "LEFT JOIN chi_tiet_don_hang ctdh ON spct.id = ctdh.id_spct " +
            "LEFT JOIN don_hang dh ON ctdh.id_don_hang = dh.id " +
            "WHERE (:searchQuery IS NULL OR " +
            "sp.ten LIKE CONCAT('%', :searchQuery, '%') OR " +
            "CAST(sp.id AS CHAR) LIKE CONCAT('%', :searchQuery, '%') OR " +
            "CAST(spct.id AS CHAR) LIKE CONCAT('%', :searchQuery, '%') OR " +
            "nh.ten_nhom LIKE CONCAT('%', :searchQuery, '%') OR " +
            "dm.ten_danh_muc LIKE CONCAT('%', :searchQuery, '%')) " +
            "AND dh.trang_thai = 4 " +
            "AND (:year IS NULL OR DATEPART(YEAR, dh.ngay_tao) = :year) " +
            "AND (:week IS NULL OR DATEPART(WEEK, dh.ngay_tao) = :week)", nativeQuery = true)
    Long countBestSellingProductsByWeekWithSearch(
            @Param("year") Integer year,
            @Param("week") Integer week,
            @Param("searchQuery") String searchQuery);

    @Query(value = "WITH ReturnStats AS ( " +
            "SELECT ctth.id_don_hang, ctth.id_spct, " +
            "SUM(ctth.so_luong) AS returned_quantity " +
            "FROM yeu_cau_tra_hang ctth " +
            "WHERE ctth.trangThai = 3 " +
            "AND ctth.ngay_duyet IS NOT NULL " +
            "AND (:year IS NULL OR DATEPART(YEAR, ctth.ngay_duyet) = :year) " +
            "AND (:month IS NULL OR DATEPART(MONTH, ctth.ngay_duyet) = :month) " +
            "GROUP BY ctth.id_don_hang, ctth.id_spct " +
            "), " +
            "ProductStats AS ( " +
            "SELECT sp.id AS id_san_pham, sp.ten AS ten_san_pham, " +
            "th.ten_thuong_hieu AS thuong_hieu, nh.ten_nhom AS nhom_huong, dm.ten_danh_muc AS danh_muc, " +
            "spct.id AS id_spct, spct.dung_tich, spct.so_luong_ton_kho, " +
            "COALESCE(SUM(CASE WHEN dh.trang_thai = 4 AND dh.id IS NOT NULL " +
            "AND (:year IS NULL OR DATEPART(YEAR, dh.ngay_tao) = :year) " +
            "AND (:month IS NULL OR DATEPART(MONTH, dh.ngay_tao) = :month) " +
            "THEN ctdh.so_luong ELSE 0 END), 0) AS total_ordered, " +
            "COALESCE(SUM(COALESCE(rs.returned_quantity, 0)), 0) AS total_returned, " +
            "CASE WHEN spct.so_luong_ton_kho = 0 THEN N'Hết hàng' " +
            "WHEN spct.so_luong_ton_kho BETWEEN 1 AND 5 THEN N'Sắp hết hàng' " +
            "ELSE 'Còn hàng' END AS stock_status " +
            "FROM san_pham sp " +
            "JOIN spct spct ON sp.id = spct.id_san_pham " +
            "LEFT JOIN thuong_hieu th ON sp.id_thuong_hieu = th.id " +
            "LEFT JOIN nhom_huong nh ON sp.id_nhom_huong = nh.id " +
            "LEFT JOIN danh_muc dm ON sp.id_danh_muc = dm.id " +
            "LEFT JOIN chi_tiet_don_hang ctdh ON spct.id = ctdh.id_spct " +
            "LEFT JOIN don_hang dh ON ctdh.id_don_hang = dh.id " +
            "LEFT JOIN ReturnStats rs ON ctdh.id_don_hang = rs.id_don_hang AND ctdh.id_spct = rs.id_spct " +
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
            "id_spct, dung_tich, so_luong_ton_kho, " +
            "(total_ordered - total_returned) AS total_quantity_sold, " +
            "stock_status, total_returned AS so_luot_tra_hang " +
            "FROM ProductStats " +
            "ORDER BY " +
            "CASE WHEN :sortField = 'totalQuantitySold' AND :sortDirection = 'asc' THEN (total_ordered - total_returned) END ASC, " +
            "CASE WHEN :sortField = 'totalQuantitySold' AND :sortDirection = 'desc' THEN (total_ordered - total_returned) END DESC, " +
            "CASE WHEN :sortField = 'soLuongTonKho' AND :sortDirection = 'asc' THEN so_luong_ton_kho END ASC, " +
            "CASE WHEN :sortField = 'soLuongTonKho' AND :sortDirection = 'desc' THEN so_luong_ton_kho END DESC, " +
            "CASE WHEN :sortField = 'soLuotTraHang' AND :sortDirection = 'asc' THEN total_returned END ASC, " +
            "CASE WHEN :sortField = 'soLuotTraHang' AND :sortDirection = 'desc' THEN total_returned END DESC " +
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
            "LEFT JOIN chi_tiet_don_hang ctdh ON spct.id = ctdh.id_spct " +
            "LEFT JOIN don_hang dh ON ctdh.id_don_hang = dh.id " +
            "WHERE (:searchQuery IS NULL OR " +
            "sp.ten LIKE CONCAT('%', :searchQuery, '%') OR " +
            "CAST(sp.id AS CHAR) LIKE CONCAT('%', :searchQuery, '%') OR " +
            "CAST(spct.id AS CHAR) LIKE CONCAT('%', :searchQuery, '%') OR " +
            "nh.ten_nhom LIKE CONCAT('%', :searchQuery, '%') OR " +
            "dm.ten_danh_muc LIKE CONCAT('%', :searchQuery, '%')) " +
            "AND dh.trang_thai = 4 " +
            "AND (:year IS NULL OR DATEPART(YEAR, dh.ngay_tao) = :year) " +
            "AND (:month IS NULL OR DATEPART(MONTH, dh.ngay_tao) = :month)", nativeQuery = true)
    Long countBestSellingProductsByMonthWithSearch(
            @Param("year") Integer year,
            @Param("month") Integer month,
            @Param("searchQuery") String searchQuery);

    @Query(value = "WITH ReturnStats AS ( " +
            "SELECT ctth.id_don_hang, ctth.id_spct, " +
            "SUM(ctth.so_luong) AS returned_quantity " +
            "FROM yeu_cau_tra_hang ctth " +
            "WHERE ctth.trangThai = 3 " +
            "AND ctth.ngay_duyet IS NOT NULL " +
            "AND (:year IS NULL OR DATEPART(YEAR, ctth.ngay_duyet) = :year) " +
            "GROUP BY ctth.id_don_hang, ctth.id_spct " +
            "), " +
            "ProductStats AS ( " +
            "SELECT sp.id AS id_san_pham, sp.ten AS ten_san_pham, " +
            "th.ten_thuong_hieu AS thuong_hieu, nh.ten_nhom AS nhom_huong, dm.ten_danh_muc AS danh_muc, " +
            "spct.id AS id_spct, spct.dung_tich, spct.so_luong_ton_kho, " +
            "COALESCE(SUM(CASE WHEN dh.trang_thai = 4 AND dh.id IS NOT NULL " +
            "AND (:year IS NULL OR DATEPART(YEAR, dh.ngay_tao) = :year) " +
            "THEN ctdh.so_luong ELSE 0 END), 0) AS total_ordered, " +
            "COALESCE(SUM(COALESCE(rs.returned_quantity, 0)), 0) AS total_returned, " +
            "CASE WHEN spct.so_luong_ton_kho = 0 THEN N'Hết hàng' " +
            "WHEN spct.so_luong_ton_kho BETWEEN 1 AND 5 THEN N'Sắp hết hàng' " +
            "ELSE 'Còn hàng' END AS stock_status " +
            "FROM san_pham sp " +
            "JOIN spct spct ON sp.id = spct.id_san_pham " +
            "LEFT JOIN thuong_hieu th ON sp.id_thuong_hieu = th.id " +
            "LEFT JOIN nhom_huong nh ON sp.id_nhom_huong = nh.id " +
            "LEFT JOIN danh_muc dm ON sp.id_danh_muc = dm.id " +
            "LEFT JOIN chi_tiet_don_hang ctdh ON spct.id = ctdh.id_spct " +
            "LEFT JOIN don_hang dh ON ctdh.id_don_hang = dh.id " +
            "LEFT JOIN ReturnStats rs ON ctdh.id_don_hang = rs.id_don_hang AND ctdh.id_spct = rs.id_spct " +
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
            "id_spct, dung_tich, so_luong_ton_kho, " +
            "(total_ordered - total_returned) AS total_quantity_sold, " +
            "stock_status, total_returned AS so_luot_tra_hang " +
            "FROM ProductStats " +
            "ORDER BY " +
            "CASE WHEN :sortField = 'totalQuantitySold' AND :sortDirection = 'asc' THEN (total_ordered - total_returned) END ASC, " +
            "CASE WHEN :sortField = 'totalQuantitySold' AND :sortDirection = 'desc' THEN (total_ordered - total_returned) END DESC, " +
            "CASE WHEN :sortField = 'soLuongTonKho' AND :sortDirection = 'asc' THEN so_luong_ton_kho END ASC, " +
            "CASE WHEN :sortField = 'soLuongTonKho' AND :sortDirection = 'desc' THEN so_luong_ton_kho END DESC, " +
            "CASE WHEN :sortField = 'soLuotTraHang' AND :sortDirection = 'asc' THEN total_returned END ASC, " +
            "CASE WHEN :sortField = 'soLuotTraHang' AND :sortDirection = 'desc' THEN total_returned END DESC " +
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
            "LEFT JOIN chi_tiet_don_hang ctdh ON spct.id = ctdh.id_spct " +
            "LEFT JOIN don_hang dh ON ctdh.id_don_hang = dh.id " +
            "WHERE (:searchQuery IS NULL OR " +
            "sp.ten LIKE CONCAT('%', :searchQuery, '%') OR " +
            "CAST(sp.id AS CHAR) LIKE CONCAT('%', :searchQuery, '%') OR " +
            "CAST(spct.id AS CHAR) LIKE CONCAT('%', :searchQuery, '%') OR " +
            "nh.ten_nhom LIKE CONCAT('%', :searchQuery, '%') OR " +
            "dm.ten_danh_muc LIKE CONCAT('%', :searchQuery, '%')) " +
            "AND dh.trang_thai = 4 " +
            "AND (:year IS NULL OR DATEPART(YEAR, dh.ngay_tao) = :year)", nativeQuery = true)
    Long countBestSellingProductsByYearWithSearch(
            @Param("year") Integer year,
            @Param("searchQuery") String searchQuery);

    @Query(value = "WITH ReturnStats AS ( " +
            "SELECT ctth.id_don_hang, ctth.id_spct, " +
            "SUM(ctth.so_luong) AS returned_quantity " +
            "FROM yeu_cau_tra_hang ctth " +
            "WHERE ctth.trangThai = 3 AND ctth.ngay_duyet IS NOT NULL " +
            "GROUP BY ctth.id_don_hang, ctth.id_spct " +
            "), " +
            "ProductStats AS ( " +
            "SELECT sp.idSanPham AS id_san_pham, sp.tenSanPham AS ten_san_pham, " +
            "MIN(spct.donGia) AS don_gia, " +
            "(SELECT ha.link FROM HinhAnh ha WHERE ha.sanPham.idSanPham = sp.idSanPham ORDER BY ha.id LIMIT 1) AS link_hinh_anh, " +
            "th.tenThuongHieu AS thuong_hieu, dm.tenDanhMuc AS danh_muc, " +
            "hd.moTaHuongDau AS huong_dau, hg.moTaHuongGiua AS huong_giua, hc.moTaHuongCuoi AS huong_cuoi, " +
            "nh.id AS nhom_huong_id, nh.tenNhomHuong AS nhom_huong, th.quocGia AS quoc_gia, " +
            "sp.trangThai AS trang_thai, " +
            "(SELECT SUM(spct2.soLuongTonKho) FROM Spct spct2 WHERE spct2.sanPham.idSanPham = sp.idSanPham) AS tong_ton_kho, " +
            "sp.createDate AS ngay_tao, " +
            "COALESCE(SUM(CASE WHEN dh.trang_thai = 4 THEN ctdh.so_luong ELSE 0 END), 0) AS total_ordered, " +
            "COALESCE(SUM(COALESCE(rs.returned_quantity, 0)), 0) AS total_returned " +
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
            "LEFT JOIN ReturnStats rs ON ctdh.id_don_hang = rs.id_don_hang AND ctdh.id_spct = rs.id_spct " +
            "WHERE dh.trang_thai = 4 " +
            "GROUP BY sp.idSanPham, sp.tenSanPham, th.tenThuongHieu, dm.tenDanhMuc, " +
            "hd.moTaHuongDau, hg.moTaHuongGiua, hc.moTaHuongCuoi, nh.id, nh.tenNhomHuong, " +
            "th.quocGia, sp.trangThai, sp.createDate " +
            ") " +
            "SELECT new com.example.scent.dto.BestSellingSanPhamInfoDTO(" +
            "id_san_pham, ten_san_pham, don_gia, link_hinh_anh, thuong_hieu, danh_muc, " +
            "huong_dau, huong_giua, huong_cuoi, nhom_huong_id, nhom_huong, quoc_gia, " +
            "trang_thai, tong_ton_kho, ngay_tao, (total_ordered - total_returned)) " +
            "FROM ProductStats " +
            "ORDER BY (total_ordered - total_returned) DESC", nativeQuery = true)
    List<BestSellingSanPhamInfoDTO> findTopSellingProducts();
}