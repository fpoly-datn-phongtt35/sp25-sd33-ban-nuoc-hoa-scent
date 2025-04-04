package com.example.scent.repo;

import java.math.BigDecimal;

public interface SanPhamBanChayDto {

        Integer getIdSanPham();

        String getTenSanPham();

        String getMoTa();

        Integer getDungTich();

        BigDecimal getDonGia();

        Integer getSoLuongTonKho();

        Integer getIdSpct();

        String getImageURL();

        Long getTongSoLuongBan();

}
