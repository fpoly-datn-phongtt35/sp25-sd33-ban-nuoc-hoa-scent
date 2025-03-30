package com.example.scent.repo;

import com.example.scent.dto.DonHangDTO;
import com.example.scent.dto.SanPhamThongKeDto;
import com.example.scent.dto.donhangDetailDTO;
import com.example.scent.entity.DonHang;
import com.example.scent.entity.PhieuGiamGia;
import com.example.scent.entity.SanPham;
import com.example.scent.entity.TaiKhoan;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository

public interface DonHangInterface extends JpaRepository<DonHang, Integer>{

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
    List<DonHang> findByTrangThai( Integer trangThai);





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
        STRING_AGG(ha.link, ', ') AS hinhAnh
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
        sp.ten, sp.mo_ta, spct.dung_tich, spct.don_gia, ctdh.so_luong
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


}
