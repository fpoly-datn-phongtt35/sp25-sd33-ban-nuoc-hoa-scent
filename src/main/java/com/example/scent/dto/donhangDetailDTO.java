package com.example.scent.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;



@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class donhangDetailDTO {
    private Integer donHangId;
    private String tenNguoiNhan;
    private String diaChiGiaoHang;
    private String sdtNguoiNhan;

    private BigDecimal tongTien;
    private LocalDateTime ngayTao;
    private LocalDateTime ngayVanChuyen;
    private String phuongThucVanChuyen;
    private String phuongThucThanhToan;
    private String tenSanPham;
    private String moTaSanPham;
    private Integer dungTich;
    private BigDecimal donGiaSPCT;
    // Số lượng sản phẩm đặt mua
    private Integer soLuong;
    private String hinhAnh;
}
