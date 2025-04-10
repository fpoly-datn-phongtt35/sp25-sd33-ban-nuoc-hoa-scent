package com.example.scent.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;


public class SanPhamDungTich {
    private Integer IdSanPham;
    private Integer dungTich ;
    private BigDecimal DonGia;
    private Integer idSpct;
    private Integer soLuongTonKho;

    public Integer getSoLuongTonKho() {
        return soLuongTonKho;
    }

    public void setSoLuongTonKho(Integer soLuongTonKho) {
        this.soLuongTonKho = soLuongTonKho;
    }

    public Integer getIdSpct() {
        return idSpct;
    }

    public void setIdSpct(Integer idSpct) {
        this.idSpct = idSpct;
    }

    public Integer getIdSanPham() {
        return IdSanPham;
    }

    public void setIdSanPham(Integer idSanPham) {
        IdSanPham = idSanPham;
    }

    public Integer getDungTich() {
        return dungTich;
    }

    public void setDungTich(Integer dungTich) {
        this.dungTich = dungTich;
    }

    public BigDecimal getDonGia() {
        return DonGia;
    }

    public void setDonGia(BigDecimal donGia) {
        DonGia = donGia;
    }

    public SanPhamDungTich(Integer idSanPham, Integer dungTich, BigDecimal donGia, Integer idSpct, Integer soLuongTonKho) {
        IdSanPham = idSanPham;
        this.dungTich = dungTich;
        DonGia = donGia;
        this.idSpct = idSpct;
        this.soLuongTonKho = soLuongTonKho;
    }

    public SanPhamDungTich() {
    }
}
