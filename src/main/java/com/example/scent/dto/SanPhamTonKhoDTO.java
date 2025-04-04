package com.example.scent.dto;

import java.math.BigDecimal;

public interface SanPhamTonKhoDTO {

    Integer getIdSanPham();

    String getTenSanPham();

    Integer getSoLuongTonKho();

    String getMoTa();

    Integer getDungTich();

    BigDecimal getDonGia();

    Integer getIdSpct();

    String getImageURL();
}
