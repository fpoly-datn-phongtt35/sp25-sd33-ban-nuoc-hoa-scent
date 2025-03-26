package com.example.scent.dto;

import java.math.BigDecimal;

public class SpctDTO {

    private BigDecimal donGia;
    private Integer soLuongTonKho;
    private Integer dungTich;
    private Integer idSanPham; // chỉ cần ID sản phẩm

    // Getter và Setter cho donGia
    public BigDecimal getDonGia() {
        return donGia;
    }

    public void setDonGia(BigDecimal donGia) {
        this.donGia = donGia;
    }

    // Getter và Setter cho soLuongTonKho
    public Integer getSoLuongTonKho() {
        return soLuongTonKho;
    }

    public void setSoLuongTonKho(Integer soLuongTonKho) {
        this.soLuongTonKho = soLuongTonKho;
    }

    // Getter và Setter cho dungTich
    public Integer getDungTich() {
        return dungTich;
    }

    public void setDungTich(Integer dungTich) {
        this.dungTich = dungTich;
    }

    // Getter và Setter cho idSanPham
    public Integer getIdSanPham() {
        return idSanPham;
    }

    public void setIdSanPham(Integer idSanPham) {
        this.idSanPham = idSanPham;
    }
}

