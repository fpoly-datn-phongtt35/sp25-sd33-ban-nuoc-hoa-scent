package com.example.scent.dto;

import java.math.BigDecimal;

public class spctDTO2 {
    private Integer idSpct;
    private Integer dungTich;
    private BigDecimal donGia;
    private String tenSanPham;
private Integer IdSanPham;
    // Constructor


    public Integer getIdSanPham() {
        return IdSanPham;
    }

    public void setIdSanPham(Integer idSanPham) {
        IdSanPham = idSanPham;
    }

    public spctDTO2(Integer idSpct, Integer dungTich, BigDecimal donGia, String tenSanPham, Integer idSanPham) {
        this.idSpct = idSpct;
        this.dungTich = dungTich;
        this.donGia = donGia;
        this.tenSanPham = tenSanPham;
        IdSanPham = idSanPham;
    }

    // Getters và Setters
    public Integer getIdSpct() {
        return idSpct;
    }

    public void setIdSpct(Integer idSpct) {
        this.idSpct = idSpct;
    }

    public Integer getDungTich() {
        return dungTich;
    }

    public void setDungTich(Integer dungTich) {
        this.dungTich = dungTich;
    }

    public BigDecimal getDonGia() {
        return donGia;
    }

    public void setDonGia(BigDecimal donGia) {
        this.donGia = donGia;
    }

    public String getTenSanPham() {
        return tenSanPham;
    }

    public void setTenSanPham(String tenSanPham) {
        this.tenSanPham = tenSanPham;
    }
}
