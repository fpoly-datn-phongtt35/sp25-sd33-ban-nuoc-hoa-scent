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

    public SanPhamDungTich(Integer idSanPham, Integer idSpct, BigDecimal donGia, Integer dungTich) {
        IdSanPham = idSanPham;
        this.idSpct = idSpct;
        DonGia = donGia;
        this.dungTich = dungTich;
    }

    public SanPhamDungTich() {
    }
}
