package com.example.scent.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;




public interface donhangDetailDTO {
    Integer getDonHangId();
    String getTenNguoiNhan();
    String getDiaChiGiaoHang();
    String getSdtNguoiNhan();
    BigDecimal getTongTien();
    LocalDateTime getNgayTao();
    LocalDateTime getNgayVanChuyen();
    String getPhuongThucVanChuyen();
    String getPhuongThucThanhToan();
    String getTenSanPham();
    String getMoTaSanPham();
    Integer getDungTich();
    BigDecimal getDonGiaSPCT();
    Integer getSoLuong();
    String getHinhAnh();
    Integer trangThai();
}
