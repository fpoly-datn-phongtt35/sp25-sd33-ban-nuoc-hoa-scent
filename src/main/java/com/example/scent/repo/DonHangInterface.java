package com.example.scent.repo;

import com.example.scent.entity.DonHang;
import com.example.scent.dto.SanPhamThongKeDto;
import com.example.scent.dto.donhangDetailDTO;
import com.example.scent.entity.PhieuGiamGia;
import com.example.scent.entity.TaiKhoan;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository

public interface DonHangInterface extends JpaRepository<DonHang, Integer> {
    List<DonHang> findByPhieuGiamGiaMaGiamGiaAndSdtNguoiNhan(String maGiamGia, String sdtNguoiNhan);
    List<DonHang> findByPhieuGiamGiaMaGiamGiaAndIdAndTaiKhoanSdt(String maGiamGia,Integer id,String sdt);
    @Query(value = "SELECT SUM(o.tong_tien) FROM don_hang o WHERE "
            + "(:year IS NULL OR YEAR(o.ngay_van_chuyen) = :year) "
            + "AND (:month IS NULL OR MONTH(o.ngay_van_chuyen) = :month)", nativeQuery = true)
    Double getTotalRevenue(@Param("year") Integer year, @Param("month") Integer month);

    @Query(value = """ 
            SELECT
                YEAR(dh.ngay_van_chuyen) AS nam,
                MONTH(dh.ngay_van_chuyen) AS thang,
                sp.ten AS tenSanPham,
                SUM(ctdh.so_luong) AS soLuong
                FROM don_hang dh
                JOIN chi_tiet_don_hang ctdh ON dh.id = ctdh.id_don_hang
                JOIN spct ON ctdh.id_spct = spct.id
                JOIN san_pham sp ON spct.id_san_pham = sp.id
                WHERE dh.trang_thai = :status
                AND (:year IS NULL OR YEAR(dh.ngay_van_chuyen) = :year)
                AND (:month IS NULL OR MONTH(dh.ngay_van_chuyen) = :month)
                GROUP BY YEAR(dh.ngay_van_chuyen), MONTH(dh.ngay_van_chuyen), sp.ten
                ORDER BY nam DESC, thang DESC, soLuong DESC """, nativeQuery = true)
    List<SanPhamThongKeDto> getProductStatistics(@Param("year") Integer year, @Param("month") Integer month, @Param("status") Integer status);

    @Modifying
    @Query("UPDATE DonHang d SET d.trangThai = 2 WHERE d.id = :id")
    void updateStatusToProcessing(@Param("id") Integer id);

    List<DonHang> findByTrangThai(Integer trangThai);


    @Query(value = """
    SELECT 
        dh.id AS donHangId,
        dh.ten_nguoi_nhan_hang AS tenNguoiNhan,
        dh.dia_chi_giao_hang AS diaChiGiaoHang,
        dh.sdt_nguoi_nhan AS sdtNguoiNhan,
        dh.tong_tien AS tongTien,
        dh.ngay_tao AS ngayTao,
        dh.ngay_van_chuyen AS ngayVanChuyen,
        dh.phuong_thuc_van_chuyen AS phuongThucVanChuyen,
        dh.phuong_thuc_thanh_toan AS phuongThucThanhToan,
        sp.ten AS tenSanPham,
        sp.mo_ta AS moTaSanPham,
        spct.dung_tich AS dungTich,
        spct.don_gia AS donGiaSPCT,
        ctdh.so_luong AS soLuong,
        STRING_AGG(ha.link, ', ') AS hinhAnh,
        dh.trang_thai as trangThai
    FROM don_hang dh
    JOIN chi_tiet_don_hang ctdh ON dh.id = ctdh.id_don_hang
    JOIN spct spct ON ctdh.id_spct = spct.id
    JOIN san_pham sp ON spct.id_san_pham = sp.id
    LEFT JOIN hinh_anh ha ON ha.id_san_pham = sp.id
    WHERE dh.id = :id
    GROUP BY 
        dh.id, dh.ten_nguoi_nhan_hang, dh.dia_chi_giao_hang, dh.sdt_nguoi_nhan,
        dh.tong_tien, dh.ngay_tao, dh.ngay_van_chuyen,
        dh.phuong_thuc_van_chuyen, dh.phuong_thuc_thanh_toan,
        sp.ten, sp.mo_ta, spct.dung_tich, spct.don_gia, ctdh.so_luong,dh.trang_thai
""", nativeQuery = true)
    List<donhangDetailDTO> findDonHangDetailsById(@Param("id") Integer id);


    @Query("SELECT dh FROM DonHang dh " +
            "LEFT JOIN FETCH dh.chiTietDonHangs ctdh " +
            "LEFT JOIN FETCH ctdh.spct spct " +
            "LEFT JOIN FETCH spct.sanPham sp " +
            "LEFT JOIN FETCH sp.hinhAnhs")
    Page<DonHang> findAllWithDetails(Pageable pageable);

    @Query("SELECT d FROM DonHang d WHERE (:trangThai IS NULL OR d.trangThai = :trangThai)")
    Page<DonHang> findByTrangThai(@Param("trangThai") Integer trangThai, Pageable pageable);


    List<DonHang> findByTaiKhoanId(Integer taiKhoanId);

    @Query(value = "select * from don_hang where loai_don_hang like 'online'", nativeQuery = true)
    List<DonHang> getAllOnline();

    @Query(value = "select * from don_hang where loai_don_hang like 'offline' and trang_thai like 'đang xử lý'", nativeQuery = true)
    List<DonHang> getAllOffline();

    List<DonHang> findByTaiKhoanAndPhieuGiamGia(TaiKhoan taiKhoan, PhieuGiamGia phieuGiamGia);

    @Query("SELECT COUNT(dh) > 0 FROM DonHang dh WHERE dh.taiKhoan = :taiKhoan AND dh.phieuGiamGia = :phieuGiamGia")
    boolean existsByTaiKhoanAndPhieuGiamGia(@Param("taiKhoan") TaiKhoan taiKhoan, @Param("phieuGiamGia") PhieuGiamGia phieuGiamGia);



    @Query(value = "SELECT k.ten_khach_hang, sp.ten, SUM(ctdh.so_luong) AS totalQuantity " +
            "FROM khach_hang k " +
            "JOIN don_hang dh ON k.id = dh.id_khach_hang " +
            "JOIN chi_tiet_don_hang ctdh ON dh.id = ctdh.id_don_hang " +
            "JOIN spct sp ON ctdh.id_spct = sp.id " +
            "WHERE dh.trang_thai = 'Hoàn thành' " +
            "GROUP BY k.ten_khach_hang, sp.ten " +
            "ORDER BY totalQuantity DESC",
            nativeQuery = true)
    List<Object[]> findTopProductsByCustomer();

    @Query(value = "SELECT sp.ten, SUM(ctdh.so_luong) AS totalQuantity " +
            "FROM chi_tiet_don_hang ctdh " +
            "JOIN spct sp ON ctdh.id_spct = sp.id " +
            "JOIN don_hang dh ON ctdh.id_don_hang = dh.id " +
            "WHERE dh.trang_thai = 'Hoàn thành' " +
            "GROUP BY sp.ten " +
            "ORDER BY totalQuantity DESC",
            nativeQuery = true)
    List<Object[]> findTopSellingProductsCompletedOrders();


    //===================Thống kê===========================


    // Tổng đơn Online hoàn thành (luongBan = 1, trangThai = 4)

    // Tổng số đơn hàng
    long count();

    long countByLuongBanAndTrangThai(Integer luongBan, Integer trangThai);

    @Query(value = "SELECT SUM(tong_tien) FROM don_hang", nativeQuery = true)
    BigDecimal getTotalRevenue();


    @Query(value = "SELECT SUM(tong_tien) FROM don_hang WHERE luong_ban = 1 AND trang_thai = 4", nativeQuery = true)
    BigDecimal getRevenueOnline();

    @Query(value = "SELECT SUM(tong_tien) FROM don_hang WHERE luong_ban = 0 AND trang_thai = 4", nativeQuery = true)
    BigDecimal getRevenueOffline();

    @Query(value = "SELECT COUNT(*) FROM don_hang WHERE luong_ban = 1", nativeQuery = true)
    long countOnlineOrders();

    @Query(value = "SELECT COUNT(*) FROM don_hang WHERE luong_ban = 0", nativeQuery = true)
    long countOfflineOrders();



    @Query(value = "SELECT SUM(tong_tien) FROM don_hang WHERE trang_thai = 4 AND DATEPART(YEAR, ngay_tao) = :year", nativeQuery = true)
    BigDecimal getTotalRevenueByYear(@Param("year") Integer year);


    // Số lượng đơn hàng theo ngày với khoảng thời gian
    @Query(value = "SELECT CONVERT(DATE, dh.ngay_tao) as ngay, COUNT(*) as soLuongDon " +
            "FROM don_hang dh " +
            "WHERE (:startDate IS NULL OR CONVERT(DATE, dh.ngay_tao) >= :startDate) " +
            "AND (:endDate IS NULL OR CONVERT(DATE, dh.ngay_tao) <= :endDate) " +
            "GROUP BY CONVERT(DATE, dh.ngay_tao) " +
            "ORDER BY ngay", nativeQuery = true)
    List<Object[]> getSoLuongDonTheoNgay(@Param("startDate") String startDate, @Param("endDate") String endDate);

    // Số lượng đơn hàng theo tuần với năm và tuần cụ thể
    @Query(value = """
    SET DATEFIRST 1; -- Đặt thứ Hai là ngày đầu tiên của tuần
    WITH Weeks AS (
        SELECT number + 1 AS tuan
        FROM master.dbo.spt_values
        WHERE type = 'P'
        AND number < 53
        AND (:week IS NULL OR number + 1 <= :week)
    )
    SELECT 
        :year AS nam,
        w.tuan,
        COALESCE(COUNT(dh.id), 0) AS soLuongDon
    FROM Weeks w
    LEFT JOIN don_hang dh ON DATEPART(YEAR, dh.ngay_tao) = :year
        AND DATEPART(WEEK, dh.ngay_tao) = w.tuan
    WHERE (:year IS NULL OR DATEPART(YEAR, dh.ngay_tao) = :year)
    GROUP BY w.tuan
    ORDER BY w.tuan
""", nativeQuery = true)
    List<Object[]> getSoLuongDonTheoTuan(@Param("year") Integer year, @Param("week") Integer week);

    // Số lượng đơn hàng theo tháng với năm và tháng cụ thể
    @Query(value = """
    WITH Months AS (
        SELECT number + 1 AS thang
        FROM master.dbo.spt_values
        WHERE type = 'P'
        AND number < 12
    )
    SELECT 
        :year AS nam,
        FORMAT(DATEADD(MONTH, m.thang - 1, CAST(CAST(:year AS VARCHAR(4)) + '-01-01' AS DATE)), 'yyyy-MM') AS thang,
        COALESCE(COUNT(dh.id), 0) AS soLuongDon
    FROM Months m
    LEFT JOIN don_hang dh ON DATEPART(YEAR, dh.ngay_tao) = :year
        AND DATEPART(MONTH, dh.ngay_tao) = m.thang
    WHERE (:year IS NULL OR DATEPART(YEAR, dh.ngay_tao) = :year)
    GROUP BY m.thang
    ORDER BY m.thang
""", nativeQuery = true)
    List<Object[]> getSoLuongDonTheoThang(@Param("year") Integer year, @Param("month") Integer month);
    // Số lượng đơn hàng theo năm với năm cụ thể
    @Query(value = """
    SELECT DATEPART(YEAR, dh.ngay_tao) AS nam, 
           COALESCE(COUNT(dh.id), 0) AS soLuongDon 
    FROM don_hang dh 
    WHERE (:year IS NULL OR DATEPART(YEAR, dh.ngay_tao) = :year) 
    GROUP BY DATEPART(YEAR, dh.ngay_tao) 
    ORDER BY nam
""", nativeQuery = true)
    List<Object[]> getSoLuongDonTheoNam(@Param("year") Integer year);
    // Thống kê doanh thu và số đơn theo ngày với khoảng thời gian
    @Query(value = "SELECT CONVERT(DATE, dh.ngay_tao) as ngay, " +
            "SUM(dh.tong_tien) as tongDoanhThu, " +
            "SUM(CASE WHEN dh.luong_ban = 1 THEN dh.tong_tien ELSE 0 END) as doanhThuOnline, " +
            "SUM(CASE WHEN dh.luong_ban = 0 THEN dh.tong_tien ELSE 0 END) as doanhThuOffline, " +
            "SUM(CASE WHEN dh.luong_ban = 1 AND dh.trang_thai = 4 THEN 1 ELSE 0 END) as onlineHoanThanh, " +
            "SUM(CASE WHEN dh.luong_ban = 1 AND dh.trang_thai = 5 THEN 1 ELSE 0 END) as onlineHuy, " +
            "SUM(CASE WHEN dh.luong_ban = 0 AND dh.trang_thai = 4 THEN 1 ELSE 0 END) as offlineHoanThanh, " +
            "SUM(CASE WHEN dh.luong_ban = 0 AND dh.trang_thai = 5 THEN 1 ELSE 0 END) as offlineHuy, " +
            "COUNT(*) as soLuongDon " +
            "FROM don_hang dh " +
            "WHERE (:startDate IS NULL OR CONVERT(DATE, dh.ngay_tao) >= :startDate) " +
            "AND (:endDate IS NULL OR CONVERT(DATE, dh.ngay_tao) <= :endDate) " +
            "GROUP BY CONVERT(DATE, dh.ngay_tao) " +
            "ORDER BY ngay", nativeQuery = true)
    List<Object[]> thongKeTheoNgay(@Param("startDate") String startDate, @Param("endDate") String endDate);

    // Thống kê doanh thu và số đơn theo tuần với năm và tuần cụ thể
    @Query(value =
            "SET DATEFIRST 1; " + // Đặt thứ Hai là ngày đầu tiên của tuần
                    "WITH Weeks AS ( " +
                    "    SELECT DISTINCT " +
                    "        DATEPART(YEAR, DATEADD(WEEK, number, DATEADD(YEAR, :year - 1900, 0))) as nam, " +
                    "        number + 1 as tuan " +
                    "    FROM master.dbo.spt_values " +
                    "    WHERE type = 'P' " +
                    "    AND DATEPART(YEAR, DATEADD(WEEK, number, DATEADD(YEAR, :year - 1900, 0))) = :year " +
                    "    AND number < DATEPART(WEEK, GETDATE()) " +
                    ") " +
                    "SELECT " +
                    "    w.nam, " +
                    "    w.tuan, " +
                    "    ISNULL(SUM(dh.tong_tien), 0) as tongDoanhThu, " +
                    "    ISNULL(SUM(CASE WHEN dh.luong_ban = 1 THEN dh.tong_tien ELSE 0 END), 0) as doanhThuOnline, " +
                    "    ISNULL(SUM(CASE WHEN dh.luong_ban = 0 THEN dh.tong_tien ELSE 0 END), 0) as doanhThuOffline, " +
                    "    ISNULL(SUM(CASE WHEN dh.luong_ban = 1 AND dh.trang_thai = 4 THEN 1 ELSE 0 END), 0) as onlineHoanThanh, " +
                    "    ISNULL(SUM(CASE WHEN dh.luong_ban = 1 AND dh.trang_thai = 5 THEN 1 ELSE 0 END), 0) as onlineHuy, " +
                    "    ISNULL(SUM(CASE WHEN dh.luong_ban = 0 AND dh.trang_thai = 4 THEN 1 ELSE 0 END), 0) as offlineHoanThanh, " +
                    "    ISNULL(SUM(CASE WHEN dh.luong_ban = 0 AND dh.trang_thai = 5 THEN 1 ELSE 0 END), 0) as offlineHuy, " +
                    "    ISNULL(COUNT(dh.id), 0) as soLuongDon " +
                    "FROM Weeks w " +
                    "LEFT JOIN don_hang dh ON " +
                    "    DATEPART(YEAR, dh.ngay_tao) = w.nam " +
                    "    AND DATEPART(WEEK, dh.ngay_tao) = w.tuan " +
                    "WHERE (:year IS NULL OR w.nam = :year) " +
                    "    AND (:week IS NULL OR w.tuan = :week) " +
                    "GROUP BY w.nam, w.tuan " +
                    "ORDER BY w.nam, w.tuan",
            nativeQuery = true)
    List<Object[]> thongKeTheoTuan(@Param("year") Integer year, @Param("week") Integer week);
    // Thống kê doanh thu và số đơn theo tháng với năm và tháng cụ thể
    @Query(value = "SELECT FORMAT(dh.ngay_tao, 'yyyy-MM') as thang, " +
            "SUM(dh.tong_tien) as tongDoanhThu, " +
            "SUM(CASE WHEN dh.luong_ban = 1 THEN dh.tong_tien ELSE 0 END) as doanhThuOnline, " +
            "SUM(CASE WHEN dh.luong_ban = 0 THEN dh.tong_tien ELSE 0 END) as doanhThuOffline, " +
            "SUM(CASE WHEN dh.luong_ban = 1 AND dh.trang_thai = 4 THEN 1 ELSE 0 END) as onlineHoanThanh, " +
            "SUM(CASE WHEN dh.luong_ban = 1 AND dh.trang_thai = 5 THEN 1 ELSE 0 END) as onlineHuy, " +
            "SUM(CASE WHEN dh.luong_ban = 0 AND dh.trang_thai = 4 THEN 1 ELSE 0 END) as offlineHoanThanh, " +
            "SUM(CASE WHEN dh.luong_ban = 0 AND dh.trang_thai = 5 THEN 1 ELSE 0 END) as offlineHuy, " +
            "COUNT(*) as soLuongDon " +
            "FROM don_hang dh " +
            "WHERE (:year IS NULL OR DATEPART(YEAR, dh.ngay_tao) = :year) " +
            "AND (:month IS NULL OR DATEPART(MONTH, dh.ngay_tao) = :month) " +
            "GROUP BY FORMAT(dh.ngay_tao, 'yyyy-MM') " +
            "ORDER BY thang", nativeQuery = true)
    List<Object[]> thongKeTheoThang(@Param("year") Integer year, @Param("month") Integer month);

    // Thống kê doanh thu và số đơn theo năm với năm cụ thể
    @Query(value = "SELECT DATEPART(YEAR, dh.ngay_tao) as nam, " +
            "SUM(dh.tong_tien) as tongDoanhThu, " +
            "SUM(CASE WHEN dh.luong_ban = 1 THEN dh.tong_tien ELSE 0 END) as doanhThuOnline, " +
            "SUM(CASE WHEN dh.luong_ban = 0 THEN dh.tong_tien ELSE 0 END) as doanhThuOffline, " +
            "SUM(CASE WHEN dh.luong_ban = 1 AND dh.trang_thai = 4 THEN 1 ELSE 0 END) as onlineHoanThanh, " +
            "SUM(CASE WHEN dh.luong_ban = 1 AND dh.trang_thai = 5 THEN 1 ELSE 0 END) as onlineHuy, " +
            "SUM(CASE WHEN dh.luong_ban = 0 AND dh.trang_thai = 4 THEN 1 ELSE 0 END) as offlineHoanThanh, " +
            "SUM(CASE WHEN dh.luong_ban = 0 AND dh.trang_thai = 5 THEN 1 ELSE 0 END) as offlineHuy, " +
            "COUNT(*) as soLuongDon " +
            "FROM don_hang dh " +
            "WHERE (:year IS NULL OR DATEPART(YEAR, dh.ngay_tao) = :year) " +
            "GROUP BY DATEPART(YEAR, dh.ngay_tao) " +
            "ORDER BY nam", nativeQuery = true)
    List<Object[]> thongKeTheoNam(@Param("year") Integer year);
    Optional<DonHang> findTopByTaiKhoanIdOrderByNgayTaoDesc(Integer id);


    List<DonHang> findByTaiKhoan(TaiKhoan taiKhoan);
}

