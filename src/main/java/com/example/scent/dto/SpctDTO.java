package com.example.scent.dto;

import java.math.BigDecimal;

public class SpctDTO {
    private Integer idSpct;
    private BigDecimal donGia;
    private Integer soLuongTonKho;
    private Integer dungTich;
    private Integer idSanPham; // chỉ cần ID sản phẩm
    private Integer trangThai;
    // Getter và Setter cho donGia
    public Integer getIdSpct() {
        return idSpct;
    }

    public void setIdSpct(Integer idSpct) {
        this.idSpct = idSpct;
    }
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

    public Integer getTrangThai() {
        return trangThai;
    }

    public void setTrangThai(Integer trangThai) {
        this.trangThai = trangThai;
    }

    public SpctDTO(Integer idSpct, BigDecimal donGia, Integer soLuongTonKho, Integer dungTich, Integer idSanPham, Integer trangThai) {
        this.idSpct = idSpct;
        this.donGia = donGia;
        this.soLuongTonKho = soLuongTonKho;
        this.dungTich = dungTich;
        this.idSanPham = idSanPham;
        this.trangThai = trangThai;
    }
}

