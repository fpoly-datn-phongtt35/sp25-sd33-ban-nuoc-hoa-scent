package com.example.scent.dto;

import java.math.BigDecimal;

public interface SanPhamDto {
    Integer getIdSanPham();

    String getTenSanPham();

    String getMoTaSanPham();

    Integer getIdSpct();

    BigDecimal getDonGia();

    Integer getSoLuongTonKho();

    Integer getDungTich();
    String getTenThuongHieu();
    String getTenDanhMuc();
    String getMoTaHuongDau();
    String getMoTaHuongGiua();
    String getMoTaHuongCuoi();
    String getimageURL();
    String getTenNhomHuong(); // Tên nhóm hương

    String getPhongCachs(); // Danh sách phong cách (chuỗi, phân tách bởi dấu phẩy)
}
