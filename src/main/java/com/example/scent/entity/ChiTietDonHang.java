package com.example.scent.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;

import lombok.NoArgsConstructor;


import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor

@Table(name = "chi_tiet_don_hang")
@Entity
public class ChiTietDonHang {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Integer id;
    @Column(name = "don_gia", precision = 19, scale = 4)
    private BigDecimal donGia;
    @Column(name = "so_luong")
    private Integer soLuong;
    @Column(name = "thanh_tien", precision = 19, scale = 4)
    private BigDecimal thanhTien;

    @ManyToOne
    @JoinColumn(name = "id_spct")
    private Spct spct;

    @ManyToOne
    @JoinColumn(name = "id_don_hang")
    @JsonBackReference
    private DonHang donHang;


    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public BigDecimal getDonGia() {
        return donGia;
    }

    public void setDonGia(BigDecimal donGia) {
        this.donGia = donGia;
    }

    public Integer getSoLuong() {
        return soLuong;
    }

    public void setSoLuong(Integer soLuong) {
        this.soLuong = soLuong;
    }

    public BigDecimal getThanhTien() {
        return thanhTien;
    }

    public void setThanhTien(BigDecimal thanhTien) {
        this.thanhTien = thanhTien;
    }

    public DonHang getDonHang() {
        return donHang;
    }

    public void setDonHang(DonHang donHang) {
        this.donHang = donHang;
    }

    public Spct getSpct() {
        return spct;
    }

    public void setSpct(Spct spct) {
        this.spct = spct;
    }
}

