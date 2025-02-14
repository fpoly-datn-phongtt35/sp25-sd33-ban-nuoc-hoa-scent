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
}
