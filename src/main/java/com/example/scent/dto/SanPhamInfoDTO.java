package com.example.scent.dto;

import jakarta.persistence.Column;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class SanPhamInfoDTO {
    private Integer IdSanPham;


    private String TenSanPham;


    private BigDecimal DonGia;
    private String imageURL;
    private String tenThuongHieu;
    private String tenDanhMuc;
    private String moTaHuongDau;
    private String moTaHuongGiua;
    private String moTaHuongCuoi;


}

