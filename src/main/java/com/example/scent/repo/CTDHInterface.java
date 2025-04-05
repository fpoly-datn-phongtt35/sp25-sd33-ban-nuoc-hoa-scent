package com.example.scent.repo;

import com.example.scent.entity.ChiTietDonHang;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository

public interface CTDHInterface extends JpaRepository<ChiTietDonHang, Integer>{
    List<ChiTietDonHang> findByDonHangId(Integer donHangId);

    @Query(value = "SELECT sp.id AS id_san_pham, sp.ten AS ten_san_pham, sp.mo_ta AS mo_ta_san_pham, " +
            "th.ten_thuong_hieu AS thuong_hieu, nh.ten_nhom AS nhom_huong, dm.ten_danh_muc AS danh_muc, " +
            "hd.mota AS huong_dau, hg.mota AS huong_giua, hc.mota AS huong_cuoi, " +
            "spct.id AS id_spct, spct.dung_tich, spct.so_luong_ton_kho, " +
            "SUM(ctdh.so_luong) AS total_quantity_sold " +
            "FROM chi_tiet_don_hang ctdh " +
            "JOIN don_hang dh ON ctdh.id_don_hang = dh.id " +
            "JOIN spct spct ON ctdh.id_spct = spct.id " +
            "JOIN san_pham sp ON spct.id_san_pham = sp.id " +
            "LEFT JOIN thuong_hieu th ON sp.id_thuong_hieu = th.id " +
            "LEFT JOIN nhom_huong nh ON sp.id_nhom_huong = nh.id " +
            "LEFT JOIN danh_muc dm ON sp.id_danh_muc = dm.id " +
            "LEFT JOIN huong_dau hd ON sp.id_huong_dau = hd.id " +
            "LEFT JOIN huong_giua hg ON sp.id_huong_giua = hg.id " +
            "LEFT JOIN huong_cuoi hc ON sp.id_huong_cuoi = hc.id " +
            "WHERE (:startDate IS NULL OR CONVERT(DATE, dh.ngay_tao) >= :startDate) " +
            "AND (:endDate IS NULL OR CONVERT(DATE, dh.ngay_tao) <= :endDate) " +
            "GROUP BY sp.id, sp.ten, sp.mo_ta, th.ten_thuong_hieu, nh.ten_nhom, dm.ten_danh_muc, hd.mota, hg.mota, hc.mota, " +
            "spct.id, spct.dung_tich, spct.so_luong_ton_kho " +
            "ORDER BY total_quantity_sold DESC", nativeQuery = true)
    List<Object[]> findBestSellingProductsByDateRange(@Param("startDate") String startDate, @Param("endDate") String endDate);

    // Best-selling products by week
    @Query(value = "SELECT sp.id AS id_san_pham, sp.ten AS ten_san_pham, sp.mo_ta AS mo_ta_san_pham, " +
            "th.ten_thuong_hieu AS thuong_hieu, nh.ten_nhom AS nhom_huong, dm.ten_danh_muc AS danh_muc, " +
            "hd.mota AS huong_dau, hg.mota AS huong_giua, hc.mota AS huong_cuoi, " +
            "spct.id AS id_spct, spct.dung_tich, spct.so_luong_ton_kho, " +
            "SUM(ctdh.so_luong) AS total_quantity_sold " +
            "FROM chi_tiet_don_hang ctdh " +
            "JOIN don_hang dh ON ctdh.id_don_hang = dh.id " +
            "JOIN spct spct ON ctdh.id_spct = spct.id " +
            "JOIN san_pham sp ON spct.id_san_pham = sp.id " +
            "LEFT JOIN thuong_hieu th ON sp.id_thuong_hieu = th.id " +
            "LEFT JOIN nhom_huong nh ON sp.id_nhom_huong = nh.id " +
            "LEFT JOIN danh_muc dm ON sp.id_danh_muc = dm.id " +
            "LEFT JOIN huong_dau hd ON sp.id_huong_dau = hd.id " +
            "LEFT JOIN huong_giua hg ON sp.id_huong_giua = hg.id " +
            "LEFT JOIN huong_cuoi hc ON sp.id_huong_cuoi = hc.id " +
            "WHERE (:year IS NULL OR DATEPART(YEAR, dh.ngay_tao) = :year) " +
            "AND (:week IS NULL OR DATEPART(WEEK, dh.ngay_tao) = :week) " +
            "GROUP BY sp.id, sp.ten, sp.mo_ta, th.ten_thuong_hieu, nh.ten_nhom, dm.ten_danh_muc, hd.mota, hg.mota, hc.mota, " +
            "spct.id, spct.dung_tich, spct.so_luong_ton_kho " +
            "ORDER BY total_quantity_sold DESC", nativeQuery = true)
    List<Object[]> findBestSellingProductsByWeek(@Param("year") Integer year, @Param("week") Integer week);

    // Best-selling products by month
    @Query(value = "SELECT sp.id AS id_san_pham, sp.ten AS ten_san_pham, sp.mo_ta AS mo_ta_san_pham, " +
            "th.ten_thuong_hieu AS thuong_hieu, nh.ten_nhom AS nhom_huong, dm.ten_danh_muc AS danh_muc, " +
            "hd.mota AS huong_dau, hg.mota AS huong_giua, hc.mota AS huong_cuoi, " +
            "spct.id AS id_spct, spct.dung_tich, spct.so_luong_ton_kho, " +
            "SUM(ctdh.so_luong) AS total_quantity_sold " +
            "FROM chi_tiet_don_hang ctdh " +
            "JOIN don_hang dh ON ctdh.id_don_hang = dh.id " +
            "JOIN spct spct ON ctdh.id_spct = spct.id " +
            "JOIN san_pham sp ON spct.id_san_pham = sp.id " +
            "LEFT JOIN thuong_hieu th ON sp.id_thuong_hieu = th.id " +
            "LEFT JOIN nhom_huong nh ON sp.id_nhom_huong = nh.id " +
            "LEFT JOIN danh_muc dm ON sp.id_danh_muc = dm.id " +
            "LEFT JOIN huong_dau hd ON sp.id_huong_dau = hd.id " +
            "LEFT JOIN huong_giua hg ON sp.id_huong_giua = hg.id " +
            "LEFT JOIN huong_cuoi hc ON sp.id_huong_cuoi = hc.id " +
            "WHERE (:year IS NULL OR DATEPART(YEAR, dh.ngay_tao) = :year) " +
            "AND (:month IS NULL OR DATEPART(MONTH, dh.ngay_tao) = :month) " +
            "GROUP BY sp.id, sp.ten, sp.mo_ta, th.ten_thuong_hieu, nh.ten_nhom, dm.ten_danh_muc, hd.mota, hg.mota, hc.mota, " +
            "spct.id, spct.dung_tich, spct.so_luong_ton_kho " +
            "ORDER BY total_quantity_sold DESC", nativeQuery = true)
    List<Object[]> findBestSellingProductsByMonth(@Param("year") Integer year, @Param("month") Integer month);

    // Best-selling products by year
    @Query(value = "SELECT sp.id AS id_san_pham, sp.ten AS ten_san_pham, sp.mo_ta AS mo_ta_san_pham, " +
            "th.ten_thuong_hieu AS thuong_hieu, nh.ten_nhom AS nhom_huong, dm.ten_danh_muc AS danh_muc, " +
            "hd.mota AS huong_dau, hg.mota AS huong_giua, hc.mota AS huong_cuoi, " +
            "spct.id AS id_spct, spct.dung_tich, spct.so_luong_ton_kho, " +
            "SUM(ctdh.so_luong) AS total_quantity_sold " +
            "FROM chi_tiet_don_hang ctdh " +
            "JOIN don_hang dh ON ctdh.id_don_hang = dh.id " +
            "JOIN spct spct ON ctdh.id_spct = spct.id " +
            "JOIN san_pham sp ON spct.id_san_pham = sp.id " +
            "LEFT JOIN thuong_hieu th ON sp.id_thuong_hieu = th.id " +
            "LEFT JOIN nhom_huong nh ON sp.id_nhom_huong = nh.id " +
            "LEFT JOIN danh_muc dm ON sp.id_danh_muc = dm.id " +
            "LEFT JOIN huong_dau hd ON sp.id_huong_dau = hd.id " +
            "LEFT JOIN huong_giua hg ON sp.id_huong_giua = hg.id " +
            "LEFT JOIN huong_cuoi hc ON sp.id_huong_cuoi = hc.id " +
            "WHERE (:year IS NULL OR DATEPART(YEAR, dh.ngay_tao) = :year) " +
            "GROUP BY sp.id, sp.ten, sp.mo_ta, th.ten_thuong_hieu, nh.ten_nhom, dm.ten_danh_muc, hd.mota, hg.mota, hc.mota, " +
            "spct.id, spct.dung_tich, spct.so_luong_ton_kho " +
            "ORDER BY total_quantity_sold DESC", nativeQuery = true)
    List<Object[]> findBestSellingProductsByYear(@Param("year") Integer year);
}
